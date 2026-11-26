import { unzipSync } from "fflate";
import { THEME_PACK_LIMITS } from "./spec";

// 投稿されたzipを、安全に展開する。展開の前に、ファイル数と展開後の大きさを、zipの目録から確かめる（展開爆弾の防止）。

export type UnzipResult = {
    /** zipの直下（または、1つだけのフォルダの中）に置かれたファイル。キーは、フォルダを除いたファイル名 */
    files: Map<string, Uint8Array>;
    /** 全てのファイルが入っていた、1つだけのフォルダの名前。直下に置かれていればnull */
    rootFolder: string | null;
    /** 無視したファイル（macOSが付けるもの） */
    ignored: string[];
    errors: string[];
};

const IGNORED = (path: string) => path.startsWith("__MACOSX/") || path.split("/").pop() === ".DS_Store";

/** `..`・絶対パス・バックスラッシュ・NULを含む名前は、展開先の外へ書き出される恐れがある */
function isUnsafePath(path: string): boolean {
    return path.startsWith("/") || path.includes("\\") || path.includes("\0") || path.split("/").some((s) => s === "..");
}

export function readThemePackZip(data: Uint8Array): UnzipResult {
    const result: UnzipResult = { files: new Map(), rootFolder: null, ignored: [], errors: [] };
    const L = THEME_PACK_LIMITS;

    if (data.length > L.totalMaxBytes) {
        result.errors.push(`zipの容量が大きすぎます。${formatBytes(L.totalMaxBytes)}以下にしてください。`);
        return result;
    }

    let count = 0;
    let total = 0;
    let tooMany = false;
    let tooBig = false;
    const names: string[] = [];

    let raw: Record<string, Uint8Array>;
    try {
        raw = unzipSync(data, {
            filter(file) {
                if (file.name.endsWith("/")) return false; // ディレクトリの項目。ファイルの名前に含まれる階層から判断する
                names.push(file.name);
                count++;
                total += file.originalSize;
                if (count > L.maxFiles) tooMany = true;
                if (total > L.totalMaxBytes) tooBig = true;
                // 上限を超えたら、以降は展開しない
                return !tooMany && !tooBig && !isUnsafePath(file.name);
            },
        });
    } catch {
        result.errors.push("zipとして読めません。壊れているか、zip以外のファイルです。");
        return result;
    }

    if (tooMany) result.errors.push(`zipの中のファイルが多すぎます。${L.maxFiles}個以下にしてください。`);
    if (tooBig) result.errors.push(`zipを展開した後の容量が大きすぎます。${formatBytes(L.totalMaxBytes)}以下にしてください。`);
    for (const name of names) {
        if (isUnsafePath(name)) result.errors.push(`「${name}」は、使えない名前です。「..」や絶対パスは使えません。`);
    }
    if (result.errors.length > 0) return result;

    const paths = Object.keys(raw).filter((p) => {
        if (IGNORED(p)) {
            result.ignored.push(p);
            return false;
        }
        return true;
    });
    if (paths.length === 0) {
        result.errors.push("zipの中に、ファイルがありません。");
        return result;
    }

    // 全てが直下か、全てが同じ1つのフォルダの中か。混在や、深い階層は認めない
    const tops = new Set(paths.map((p) => (p.includes("/") ? p.slice(0, p.indexOf("/")) : "")));
    if (tops.size > 1) {
        result.errors.push("zipの構成が正しくありません。pack.jsonと画像は、zipの直下か、idと同じ名前の1つのディレクトリの中に置いてください。");
        return result;
    }
    const root = [...tops][0];
    result.rootFolder = root === "" ? null : root;

    for (const p of paths) {
        const rel = root === "" ? p : p.slice(root.length + 1);
        if (rel.includes("/")) {
            result.errors.push(`「${p}」は、子ディレクトリの中にあります。子ディレクトリは使えません。`);
            continue;
        }
        result.files.set(rel, raw[p]);
    }
    return result;
}

export function formatBytes(n: number): string {
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(n % (1024 * 1024) === 0 ? 0 : 1)}MB`;
    if (n >= 1024) return `${Math.round(n / 1024)}KB`;
    return `${n}バイト`;
}
