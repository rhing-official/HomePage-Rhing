import { zipSync } from "fflate";
import { COLOR_KEYS, SHAPE_RANGES, THEME_PACK_FORMAT_VERSION, type ThemePackBrightness, type ThemePackColorKey } from "./spec";

// 作成画面の入力（下書き）から、pack.jsonとzipを組み立てる。出来たzipは、投稿と同じ `validateThemePackZip` で検査する。

export type DraftColors = Partial<Record<ThemePackColorKey, string>>;

export type ThemePackDraft = {
    id: string;
    name: string;
    /** 作者の表示。作成画面では書かない（空なら、DaiDaiの呼び名が表示される） */
    author: string;
    brightness: ThemePackBrightness;
    shape: { borderWidth: number; radius: number; shadowOffset: [number, number] };
    colors: { light: DraftColors; dark: DraftColors };
    /** 背景画像。拡張子は、png・webp・jpegのいずれか */
    background?: { ext: "png" | "webp" | "jpg"; bytes: Uint8Array };
    /** メニューチップの画像（png） */
    menuChip?: { bytes: Uint8Array };
};

export const BACKGROUND_FILE_BASE = "background";
export const MENU_CHIP_FILE = "menu-chip.png";

/** 利用者には見せない内部の識別子。半角の小文字・数字・ハイフンで、40文字以内（`pack.json`のidの規則） */
export function newPackId(): string {
    return crypto.randomUUID();
}

export function emptyDraft(): ThemePackDraft {
    return {
        id: newPackId(),
        name: "",
        author: "",
        brightness: "both",
        shape: {
            borderWidth: SHAPE_RANGES.borderWidth.fallback,
            radius: SHAPE_RANGES.radius.fallback,
            shadowOffset: [...SHAPE_RANGES.shadowOffset.fallback],
        },
        colors: { light: {}, dark: {} },
    };
}

export function backgroundFileName(d: ThemePackDraft): string | undefined {
    return d.background ? `${BACKGROUND_FILE_BASE}.${d.background.ext}` : undefined;
}

/** 空の色は書かない。使わない外観（brightnessの外）の色も、書かない */
function cleanColors(colors: DraftColors): DraftColors {
    const out: DraftColors = {};
    for (const k of COLOR_KEYS) {
        const v = colors[k]?.trim();
        if (v) out[k] = v;
    }
    return out;
}

export function buildPackJson(d: ThemePackDraft): string {
    const useLight = d.brightness !== "dark";
    const useDark = d.brightness !== "light";
    const colors: Record<string, DraftColors> = {};
    if (useLight) colors.light = cleanColors(d.colors.light);
    if (useDark) colors.dark = cleanColors(d.colors.dark);
    const images: Record<string, string> = {};
    const bg = backgroundFileName(d);
    if (bg) images.background = bg;
    if (d.menuChip) images.menuChip = MENU_CHIP_FILE;
    return JSON.stringify(
        {
            formatVersion: THEME_PACK_FORMAT_VERSION,
            id: d.id.trim(),
            name: d.name.trim(),
            author: d.author.trim(),
            brightness: d.brightness,
            shape: d.shape,
            colors,
            ...(Object.keys(images).length > 0 ? { images } : {}),
        },
        null,
        2,
    );
}

export function buildThemePackZip(d: ThemePackDraft): Uint8Array {
    const files: Record<string, Uint8Array> = { "pack.json": new TextEncoder().encode(buildPackJson(d)) };
    const bg = backgroundFileName(d);
    if (bg && d.background) files[bg] = d.background.bytes;
    if (d.menuChip) files[MENU_CHIP_FILE] = d.menuChip.bytes;
    return zipSync(files);
}
