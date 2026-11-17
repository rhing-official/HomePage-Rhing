// ぺったん画像の規格。重い画像を防ぐため、アップロード前に画面で検査する。
export const STICKER_MAX_SIDE_PX = 512;
export const STICKER_MAX_BYTES = 2 * 1024 * 1024;
export const SVG_TYPE = "image/svg+xml";
export const STICKER_ALLOWED_TYPES = ["image/png", "image/webp", "image/jpeg", "image/gif", SVG_TYPE];

export interface ImageSpec {
    type: string;
    size: number;
    width: number;
    height: number;
}

// 規格に合っていれば null、合わなければ理由を返す
// SVGはベクターなので、長辺の制限は対象外
export function checkImageSpec({ type, size, width, height }: ImageSpec): string | null {
    if (!STICKER_ALLOWED_TYPES.includes(type)) return "PNG・WebP・JPEG・GIF・SVGのみ使えます";
    if (size > STICKER_MAX_BYTES) return `ファイルサイズは${STICKER_MAX_BYTES / 1024 / 1024}MB以下にしてください`;
    if (type !== SVG_TYPE && Math.max(width, height) > STICKER_MAX_SIDE_PX) {
        return `長辺${STICKER_MAX_SIDE_PX}px以下にしてください（${width}×${height}px）`;
    }
    return null;
}

function readSize(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("読み込めない画像です"));
        };
        img.src = url;
    });
}

// ブラウザによってはSVGのfile.typeが空になるため、拡張子で補う
export function stickerFileType(file: File): string {
    if (!file.type && /\.svg$/i.test(file.name)) return SVG_TYPE;
    return file.type;
}

// SVGから、スクリプトなど実行され得る要素・属性を取り除く。SVGでなければnull
export function sanitizeSvg(source: string): string | null {
    const doc = new DOMParser().parseFromString(source, "image/svg+xml");
    const root = doc.documentElement;
    if (doc.querySelector("parsererror") || root.localName !== "svg") return null;
    doc.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((el) => el.remove());
    for (const el of Array.from(doc.querySelectorAll("*"))) {
        for (const attr of Array.from(el.attributes)) {
            const isHref = attr.localName === "href";
            const unsafeHref = isHref && !/^\s*#/.test(attr.value) && !/^\s*data:image\/(png|jpe?g|gif|webp)/i.test(attr.value);
            if (/^on/i.test(attr.name) || unsafeHref || /javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
        }
    }
    return new XMLSerializer().serializeToString(doc);
}

// 検査に通ったファイルを、アップロードできる形にして返す（SVGはサニタイズ済みの内容に差し替える）。通らなければ理由を返す
export async function prepareStickerImage(file: File): Promise<{ file: File } | { error: string }> {
    const type = stickerFileType(file);
    // 形式とサイズは、画像を読み込む前に判定できる
    const early = checkImageSpec({ type, size: file.size, width: 0, height: 0 });
    if (early) return { error: early };
    if (type === SVG_TYPE) {
        const clean = sanitizeSvg(await file.text());
        if (!clean) return { error: "読み込めない画像です" };
        return { file: new File([clean], file.name, { type: SVG_TYPE }) };
    }
    const error = await validateStickerImage(file);
    return error ? { error } : { file };
}

export async function validateStickerImage(file: File): Promise<string | null> {
    const type = stickerFileType(file);
    const early = checkImageSpec({ type, size: file.size, width: 0, height: 0 });
    if (early) return early;
    if (type === SVG_TYPE) return null;
    try {
        const { width, height } = await readSize(file);
        return checkImageSpec({ type, size: file.size, width, height });
    } catch {
        return "読み込めない画像です";
    }
}
