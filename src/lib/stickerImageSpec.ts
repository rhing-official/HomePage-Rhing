// ぺったん画像の規格。重い画像を防ぐため、アップロード前に画面で検査する。
export const STICKER_MAX_SIDE_PX = 512;
export const STICKER_MAX_BYTES = 2 * 1024 * 1024;
export const STICKER_ALLOWED_TYPES = ["image/png", "image/webp", "image/jpeg", "image/gif"];

export interface ImageSpec {
    type: string;
    size: number;
    width: number;
    height: number;
}

// 規格に合っていれば null、合わなければ理由を返す
export function checkImageSpec({ type, size, width, height }: ImageSpec): string | null {
    if (!STICKER_ALLOWED_TYPES.includes(type)) return "PNG・WebP・JPEG・GIFのみ使えます";
    if (size > STICKER_MAX_BYTES) return `ファイルサイズは${STICKER_MAX_BYTES / 1024 / 1024}MB以下にしてください`;
    if (Math.max(width, height) > STICKER_MAX_SIDE_PX) {
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

export async function validateStickerImage(file: File): Promise<string | null> {
    // 形式とサイズは、画像を読み込む前に判定できる
    const early = checkImageSpec({ type: file.type, size: file.size, width: 0, height: 0 });
    if (early) return early;
    try {
        const { width, height } = await readSize(file);
        return checkImageSpec({ type: file.type, size: file.size, width, height });
    } catch {
        return "読み込めない画像です";
    }
}
