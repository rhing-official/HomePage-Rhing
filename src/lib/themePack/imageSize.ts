// 画像のヘッダーから、形式と大きさを読む。ブラウザのAPI（Image・canvas）に頼らず、バイト列だけで判定する。
// 投稿されたzipの中身を、拡張子ではなく中身で確かめるために使う（拡張子の偽装を拒否する）。

export type ImageType = "png" | "webp" | "jpeg";
export type ImageInfo = { type: ImageType; width: number; height: number };

const u16be = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u32be = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u24le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

function readPng(b: Uint8Array): ImageInfo | null {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (b.length < 24 || !sig.every((v, i) => b[i] === v)) return null;
    if (ascii(b, 12, 4) !== "IHDR") return null;
    return { type: "png", width: u32be(b, 16), height: u32be(b, 20) };
}

function readJpeg(b: Uint8Array): ImageInfo | null {
    if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
    let o = 2;
    while (o + 4 <= b.length) {
        if (b[o] !== 0xff) return null;
        // 区切りの0xFFが続くことがある
        while (b[o] === 0xff && o < b.length) o++;
        const marker = b[o];
        o++;
        // 長さを持たないマーカー
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        if (marker === 0xd9 || marker === 0xda) return null;
        if (o + 2 > b.length) return null;
        const len = u16be(b, o);
        const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSof) {
            if (o + 7 > b.length) return null;
            return { type: "jpeg", height: u16be(b, o + 3), width: u16be(b, o + 5) };
        }
        o += len;
    }
    return null;
}

function readWebp(b: Uint8Array): ImageInfo | null {
    if (b.length < 30 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;
    const kind = ascii(b, 12, 4);
    const d = 20; // チャンクの中身の始まり
    if (kind === "VP8 ") {
        // 非可逆。フレームの開始コード 9D 01 2A の後ろに、幅と高さ（各14ビット）
        if (b[d + 3] !== 0x9d || b[d + 4] !== 0x01 || b[d + 5] !== 0x2a) return null;
        return { type: "webp", width: u16le(b, d + 6) & 0x3fff, height: u16le(b, d + 8) & 0x3fff };
    }
    if (kind === "VP8L") {
        // 可逆。署名0x2Fの後ろに、幅-1と高さ-1（各14ビット）
        if (b[d] !== 0x2f) return null;
        const b1 = b[d + 1], b2 = b[d + 2], b3 = b[d + 3], b4 = b[d + 4];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        return { type: "webp", width, height };
    }
    if (kind === "VP8X") {
        // 拡張。幅-1と高さ-1（各24ビット）
        return { type: "webp", width: 1 + u24le(b, d + 4), height: 1 + u24le(b, d + 7) };
    }
    return null;
}

/** png / webp / jpeg のいずれかなら、形式と大きさ。それ以外、または壊れていればnull */
export function readImageInfo(bytes: Uint8Array): ImageInfo | null {
    return readPng(bytes) ?? readJpeg(bytes) ?? readWebp(bytes);
}

/** 拡張子（小文字）から期待する形式。対応しない拡張子はnull */
export function imageTypeForExtension(ext: string): ImageType | null {
    switch (ext.toLowerCase()) {
        case "png":
            return "png";
        case "webp":
            return "webp";
        case "jpg":
        case "jpeg":
            return "jpeg";
        default:
            return null;
    }
}
