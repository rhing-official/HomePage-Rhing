import { describe, expect, it } from "vitest";
import { imageTypeForExtension, readImageInfo } from "./imageSize";
import { jpegBytes, pngBytes, webpLosslessBytes, webpLossyBytes, webpVp8xBytes } from "./testBytes";

describe("画像のヘッダーの読み取り", () => {
    it("pngの形式と大きさ", () => {
        expect(readImageInfo(pngBytes(1080, 1920))).toEqual({ type: "png", width: 1080, height: 1920 });
    });
    it("jpegの形式と大きさ", () => {
        expect(readImageInfo(jpegBytes(640, 480))).toEqual({ type: "jpeg", width: 640, height: 480 });
    });
    it("webpの3種（拡張・可逆・非可逆）", () => {
        expect(readImageInfo(webpVp8xBytes(2048, 1024))).toEqual({ type: "webp", width: 2048, height: 1024 });
        expect(readImageInfo(webpLosslessBytes(800, 600))).toEqual({ type: "webp", width: 800, height: 600 });
        expect(readImageInfo(webpLossyBytes(320, 200))).toEqual({ type: "webp", width: 320, height: 200 });
    });
    it("画像でないものや壊れたものはnull", () => {
        expect(readImageInfo(new TextEncoder().encode("hello world, this is not an image at all"))).toBeNull();
        expect(readImageInfo(new Uint8Array(0))).toBeNull();
        expect(readImageInfo(pngBytes(10, 10).subarray(0, 12))).toBeNull();
    });
    it("拡張子から期待する形式", () => {
        expect(imageTypeForExtension("PNG")).toBe("png");
        expect(imageTypeForExtension("jpg")).toBe("jpeg");
        expect(imageTypeForExtension("jpeg")).toBe("jpeg");
        expect(imageTypeForExtension("webp")).toBe("webp");
        expect(imageTypeForExtension("gif")).toBeNull();
        expect(imageTypeForExtension("svg")).toBeNull();
    });
});
