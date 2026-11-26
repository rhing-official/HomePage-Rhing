import { checkContrast, describeContrast, MIN_CONTRAST_RATIO, type ContrastReport } from "./contrast";
import { imageTypeForExtension, readImageInfo } from "./imageSize";
import { parseThemePack, THEME_PACK_LIMITS, type ParsedThemePack } from "./spec";
import { formatBytes, readThemePackZip } from "./zip";

// 素材パックのzipを、投稿の前に検査する（ブラウザの中で完結する。ファイルは外へ送らない）。
// errorsが1つでもあれば、投稿できない。warningsは、投稿はできるが、直した方がよい点。

export type ValidationResult = {
    ok: boolean;
    errors: string[];
    warnings: string[];
    /** 確認できた項目（投稿者を安心させるための一覧） */
    passed: string[];
    pack?: ParsedThemePack;
    contrast?: ContrastReport;
    /** 背景画像の情報（あれば） */
    background?: { file: string; width: number; height: number; bytes: number };
    /** 展開したファイル（送信の時に、そのまま保存先へ置く）。キーは、フォルダを除いたファイル名 */
    files?: Map<string, Uint8Array>;
};

const PACK_FILE = "pack.json";

/** 実行できる形式・スクリプトとして扱われる拡張子。画像でもpack.jsonでもないファイルのうち、理由を分かりやすく伝えるために分ける */
const EXECUTABLE_EXTENSIONS = new Set([
    "exe", "bat", "cmd", "com", "msi", "scr", "lnk", "ps1", "vbs", "sh", "bash", "zsh",
    "js", "mjs", "cjs", "ts", "py", "rb", "pl", "php", "jar", "dll", "so", "dylib", "app", "apk", "html", "htm", "svg",
]);

function extensionOf(name: string): string {
    const i = name.lastIndexOf(".");
    return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

export function validateThemePackZip(data: Uint8Array): ValidationResult {
    const result: ValidationResult = { ok: false, errors: [], warnings: [], passed: [] };
    const L = THEME_PACK_LIMITS;

    const unzip = readThemePackZip(data);
    result.errors.push(...unzip.errors);
    if (unzip.errors.length > 0 && unzip.files.size === 0) return finish(result);
    if (unzip.ignored.length > 0) result.warnings.push("macOSが付けた不要なファイル（__MACOSXや.DS_Store）は、無視しました。");

    result.files = unzip.files;

    // pack.json
    const packBytes = unzip.files.get(PACK_FILE);
    if (!packBytes) {
        result.errors.push("pack.jsonがありません。zipの直下、またはidと同じ名前のディレクトリの直下に置いてください。");
        return finish(result);
    }
    if (packBytes.length > L.packJsonMaxBytes) {
        result.errors.push(`pack.jsonが大きすぎます。${formatBytes(L.packJsonMaxBytes)}以下にしてください。`);
        return finish(result);
    }
    let source: string;
    try {
        source = new TextDecoder("utf-8", { fatal: true }).decode(packBytes);
    } catch {
        result.errors.push("pack.jsonが、UTF-8の文字列として読めません。");
        return finish(result);
    }
    const parsed = parseThemePack(source);
    if (!parsed.ok) {
        result.errors.push(parsed.error);
        return finish(result);
    }
    const { pack } = parsed;
    result.pack = pack;
    result.warnings.push(...parsed.warnings);
    result.passed.push("pack.jsonを読めました");
    if (parsed.warnings.length === 0) result.passed.push("数値と色の形式に問題はありません");

    // ディレクトリ名とidの一致
    if (unzip.rootFolder !== null) {
        if (unzip.rootFolder !== pack.id) {
            result.errors.push(`ディレクトリの名前「${unzip.rootFolder}」と、pack.jsonのid「${pack.id}」が一致しません。`);
        } else {
            result.passed.push("ディレクトリの名前とidが一致しています");
        }
    }

    // ファイルの種類
    const imageNames: string[] = [];
    for (const [name, bytes] of unzip.files) {
        if (name === PACK_FILE) continue;
        if (name.startsWith(".")) {
            result.errors.push(`「${name}」は隠しファイルです。使えません。`);
            continue;
        }
        const ext = extensionOf(name);
        if (EXECUTABLE_EXTENSIONS.has(ext)) {
            result.errors.push(`「${name}」は、実行できる形式かスクリプトです。素材パックには、コードを含められません。`);
            continue;
        }
        const expected = imageTypeForExtension(ext);
        if (!expected) {
            result.errors.push(`「${name}」は、使えないファイルです。pack.jsonと、png・webp・jpegの画像だけにしてください。`);
            continue;
        }
        imageNames.push(name);
        if (bytes.length > L.imageMaxBytes) {
            result.errors.push(`「${name}」の容量が大きすぎます。1枚あたり${formatBytes(L.imageMaxBytes)}以下にしてください。`);
        }
        const info = readImageInfo(bytes);
        if (!info) {
            result.errors.push(`「${name}」は、画像として読めません。壊れているか、拡張子と中身の形式が違います。`);
            continue;
        }
        if (info.type !== expected) {
            result.errors.push(`「${name}」の拡張子と、画像の中身の形式が一致しません。`);
        }
        if (info.width > L.imageMaxSide || info.height > L.imageMaxSide) {
            result.errors.push(`「${name}」の大きさが${info.width}×${info.height}です。各辺${L.imageMaxSide}px以下にしてください。`);
        }
        if (pack.backgroundImage === name) {
            result.background = { file: name, width: info.width, height: info.height, bytes: bytes.length };
        }
    }

    // 背景画像の指定
    if (pack.backgroundImage) {
        if (!unzip.files.has(pack.backgroundImage)) {
            result.errors.push(`背景画像「${pack.backgroundImage}」が、zipの中にありません。`);
        } else if (!imageNames.includes(pack.backgroundImage)) {
            result.errors.push(`背景画像「${pack.backgroundImage}」は、png・webp・jpegの画像ではありません。`);
        } else if (result.background) {
            result.passed.push(`背景画像の形式・大きさ・容量に問題はありません（${result.background.width}×${result.background.height}、${formatBytes(result.background.bytes)}）`);
        }
    }
    const unused = imageNames.filter((n) => n !== pack.backgroundImage);
    if (unused.length > 0) {
        result.warnings.push(`pack.jsonで使われていない画像があります。${unused.map((n) => `「${n}」`).join("")}は、今のアプリでは表示されません。`);
    }

    // コントラスト
    const contrast = checkContrast(pack);
    result.contrast = contrast;
    for (const c of contrast.checks) {
        if (c.pass) continue;
        result.errors.push(`${describeContrast(c)}。読みやすさの基準は${MIN_CONTRAST_RATIO}以上です。文字の色と背景の色を、離してください。`);
    }
    const passedChecks = contrast.checks.filter((c) => c.pass);
    if (passedChecks.length > 0 && passedChecks.length === contrast.checks.length) {
        result.passed.push(`文字の読みやすさ（コントラスト比${MIN_CONTRAST_RATIO}以上）を、${passedChecks.length}組で確認しました`);
    }
    if (contrast.skipped.length > 0) {
        result.warnings.push("片方の色が書かれていない組は、コントラストを確認できていません。書かれていない色は、アプリが標準の色から決めます。");
    }

    return finish(result);
}

function finish(result: ValidationResult): ValidationResult {
    result.ok = result.errors.length === 0;
    return result;
}
