// 意匠（pack.json）の読み取りと検査。DaiDai本体の `lib/theme_pack/theme_pack.dart` の
// `ThemePackParser` の規則を、TypeScriptへ移植したもの（2026-11-26、DaiDai-privateの`文書/検討/素材パック.md`）。
// アプリ側は、範囲外の数値を丸め、不正な色を未指定にして読み込む。横丁は、それらを「警告」として投稿者へ返す。
// 規則の食い違いを避けるため、テストの入力例は `DaiDai/test/theme_pack_test.dart` に合わせている。

/** 意匠の形式の版。アプリが読めるのは、この版以下 */
export const THEME_PACK_FORMAT_VERSION = 1;

export const THEME_PACK_LIMITS = {
    /** 背景画像の各辺（px） */
    imageMaxSide: 2048,
    /** 画像1枚の容量（バイト） */
    imageMaxBytes: 2 * 1024 * 1024,
    /** zip全体（展開後の合計）の容量（バイト） */
    totalMaxBytes: 3 * 1024 * 1024,
    /** zipの中のファイル数（pack.jsonを含む） */
    maxFiles: 20,
    /** pack.jsonの容量（バイト） */
    packJsonMaxBytes: 64 * 1024,
    /** 1人が投稿できる件数（公開中と審査中の合計）。手順②以降で使う */
    maxPacksPerUser: 5,
} as const;

export const SHAPE_RANGES = {
    borderWidth: { min: 0, max: 6, fallback: 2.5 },
    radius: { min: 0, max: 32, fallback: 8 },
    shadowOffset: { min: -12, max: 12, fallback: [4, 4] as [number, number] },
} as const;

export type ThemePackBrightness = "light" | "dark" | "both";

export type ThemePackColorKey = "accent" | "background" | "panel" | "text" | "onAccent" | "line";
export const COLOR_KEYS: ThemePackColorKey[] = ["accent", "background", "panel", "text", "onAccent", "line"];
export const COLOR_LABELS: Record<ThemePackColorKey, string> = {
    accent: "強調色",
    background: "背景",
    panel: "パネル",
    text: "文字",
    onAccent: "強調色の上の文字",
    line: "枠線",
};

/** 色。`#RRGGBB`に正規化した文字列（透明度は捨てる）。未指定はundefined */
export type ThemePackColors = Partial<Record<ThemePackColorKey, string>>;

export type ParsedThemePack = {
    formatVersion: number;
    id: string;
    name: string;
    author: string;
    brightness: ThemePackBrightness;
    shape: { borderWidth: number; radius: number; shadowOffset: [number, number] };
    colors: { light: ThemePackColors; dark: ThemePackColors };
    backgroundImage?: string;
};

export type ParseResult =
    | { ok: true; pack: ParsedThemePack; warnings: string[] }
    | { ok: false; error: string };

const ID_PATTERN = /^[a-z0-9-]{1,40}$/;
const IMAGE_FILE_PATTERN = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9]+)?$/;

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * `RRGGBB` / `#RRGGBB` / `RRGGBBAA` / `#RRGGBBAA` を、`#RRGGBB`（大文字）に直す。8桁は、末尾2桁を透明度として捨てる。
 * 不正な形式はnull。DaiDai本体の `tryParseHexColor` と同じ。
 */
export function normalizeHexColor(input: string): { hex: string; hadAlpha: boolean } | null {
    const body = input.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(body)) return null;
    return { hex: `#${body.slice(0, 6).toUpperCase()}`, hadAlpha: body.length === 8 };
}

function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
}

/** 範囲外なら、投稿者への警告を足して、丸めた値を返す（アプリ側の丸めと同じ結果） */
function readNumber(
    value: unknown,
    range: { min: number; max: number; fallback: number },
    label: string,
    warnings: string[],
): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        if (value !== undefined) warnings.push(`${label}は数値で書いてください。標準の値になります。`);
        return range.fallback;
    }
    const clamped = clamp(value, range.min, range.max);
    if (clamped !== value) {
        warnings.push(`${label}が範囲外です。${range.min}〜${range.max}で書いてください。アプリでは${clamped}になります。`);
    }
    return clamped;
}

function readColors(value: unknown, scope: "light" | "dark", warnings: string[]): ThemePackColors {
    const out: ThemePackColors = {};
    if (!isRecord(value)) return out;
    for (const key of COLOR_KEYS) {
        const raw = value[key];
        if (raw === undefined) continue;
        const where = `${scope === "light" ? "明るい" : "暗い"}外観の${COLOR_LABELS[key]}`;
        if (typeof raw !== "string") {
            warnings.push(`${where}の色は、文字列で書いてください。未指定として扱われます。`);
            continue;
        }
        const parsed = normalizeHexColor(raw);
        if (!parsed) {
            warnings.push(`${where}の色が正しい形式ではありません。#RRGGBBで書いてください。未指定として扱われます。`);
            continue;
        }
        if (parsed.hadAlpha) warnings.push(`${where}の色は、透明度を含んでいます。透明度は使われず、不透明になります。`);
        out[key] = parsed.hex;
    }
    return out;
}

/**
 * pack.jsonの文字列を読む。致命的な誤りは `{ok:false}`、範囲外の数値や不正な色は、警告つきで `{ok:true}`。
 * 検査の順序と、エラーにする条件は、DaiDai本体の `ThemePackParser.parse` と同じ。
 */
export function parseThemePack(source: string): ParseResult {
    let json: unknown;
    try {
        json = JSON.parse(source);
    } catch {
        return { ok: false, error: "pack.jsonが壊れています。JSONとして読めません。" };
    }
    if (!isRecord(json)) return { ok: false, error: "pack.jsonの形が正しくありません。最上位は、波括弧で囲んだ項目の集まりにしてください。" };

    const formatVersion = json.formatVersion;
    if (typeof formatVersion !== "number" || !Number.isInteger(formatVersion)) {
        return { ok: false, error: "formatVersionが書かれていません。整数で書いてください。" };
    }
    if (formatVersion > THEME_PACK_FORMAT_VERSION) {
        return { ok: false, error: `formatVersionが${formatVersion}です。このアプリが読めるのは、${THEME_PACK_FORMAT_VERSION}以下です。` };
    }

    const id = json.id;
    if (typeof id !== "string" || !ID_PATTERN.test(id)) {
        return { ok: false, error: "idが正しくありません。半角の小文字・数字・ハイフンで、1〜40文字にしてください。" };
    }

    const name = json.name;
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 40) {
        return { ok: false, error: "nameが正しくありません。1〜40文字にしてください。" };
    }

    const warnings: string[] = [];
    const author = typeof json.author === "string" ? json.author : "";
    if (typeof json.author !== "string") warnings.push("authorが文字列で書かれていません。投稿者名は、DaiDaiの呼び名が表示されます。");

    const b = json.brightness;
    const brightness: ThemePackBrightness = b === "light" || b === "dark" || b === "both" ? b : "both";
    if (b !== undefined && brightness !== b) warnings.push("brightnessは、light・dark・bothのどれかで書いてください。bothとして扱われます。");

    const shapeSrc = isRecord(json.shape) ? json.shape : {};
    const borderWidth = readNumber(shapeSrc.borderWidth, SHAPE_RANGES.borderWidth, "shapeのborderWidth", warnings);
    const radius = readNumber(shapeSrc.radius, SHAPE_RANGES.radius, "shapeのradius", warnings);
    let shadowOffset: [number, number] = [...SHAPE_RANGES.shadowOffset.fallback];
    const so = shapeSrc.shadowOffset;
    if (so !== undefined) {
        if (Array.isArray(so) && so.length === 2 && so.every((n) => typeof n === "number" && Number.isFinite(n))) {
            const range = { min: SHAPE_RANGES.shadowOffset.min, max: SHAPE_RANGES.shadowOffset.max };
            const x = clamp(so[0] as number, range.min, range.max);
            const y = clamp(so[1] as number, range.min, range.max);
            if (x !== so[0] || y !== so[1]) {
                warnings.push(`shapeのshadowOffsetが範囲外です。各${range.min}〜${range.max}で書いてください。アプリでは[${x}, ${y}]になります。`);
            }
            shadowOffset = [x, y];
        } else {
            warnings.push("shapeのshadowOffsetは、数値2つの並びで書いてください。標準の値になります。");
        }
    }

    const colorsSrc = isRecord(json.colors) ? json.colors : {};
    const colors = {
        light: readColors(colorsSrc.light, "light", warnings),
        dark: readColors(colorsSrc.dark, "dark", warnings),
    };

    let backgroundImage: string | undefined;
    const imagesSrc = isRecord(json.images) ? json.images : {};
    const bg = imagesSrc.background;
    if (bg !== undefined) {
        if (typeof bg !== "string" || !IMAGE_FILE_PATTERN.test(bg)) {
            return {
                ok: false,
                error: "背景画像のファイル名が正しくありません。ディレクトリや「..」、URLは使えません。英数字・アンダースコア・ハイフンと、拡張子だけにしてください。",
            };
        }
        backgroundImage = bg;
    }

    return {
        ok: true,
        pack: { formatVersion, id, name: name.trim(), author, brightness, shape: { borderWidth, radius, shadowOffset }, colors, backgroundImage },
        warnings,
    };
}
