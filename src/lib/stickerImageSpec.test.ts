import { describe, expect, it } from "vitest";
import { checkImageSpec, STICKER_MAX_BYTES, STICKER_MAX_SIDE_PX } from "./stickerImageSpec";

const ok = { type: "image/png", size: 1000, width: 512, height: 300 };

describe("checkImageSpec", () => {
    it("規格内なら通る", () => {
        expect(checkImageSpec(ok)).toBeNull();
        expect(checkImageSpec({ ...ok, type: "image/gif" })).toBeNull();
    });
    it("長辺が上限を超えると弾く（縦長も）", () => {
        expect(checkImageSpec({ ...ok, width: STICKER_MAX_SIDE_PX + 1 })).toContain("長辺512px");
        expect(checkImageSpec({ ...ok, width: 100, height: 513 })).toContain("513");
    });
    it("2MBを超えると弾く", () => {
        expect(checkImageSpec({ ...ok, size: STICKER_MAX_BYTES })).toBeNull();
        expect(checkImageSpec({ ...ok, size: STICKER_MAX_BYTES + 1 })).toContain("2MB");
    });
    it("512×512ちょうどは通る", () => {
        expect(checkImageSpec({ ...ok, width: 512, height: 512 })).toBeNull();
    });
    it("SVGは長辺の制限を受けないが、2MBは超えられない", () => {
        const svg = { ...ok, type: "image/svg+xml" };
        expect(checkImageSpec({ ...svg, width: 0, height: 0 })).toBeNull();
        expect(checkImageSpec({ ...svg, width: 4000, height: 4000 })).toBeNull();
        expect(checkImageSpec({ ...svg, size: STICKER_MAX_BYTES + 1 })).toContain("2MB");
    });
    it("対応していない形式は弾く", () => {
        expect(checkImageSpec({ ...ok, type: "image/bmp" })).toContain("PNG");
        expect(checkImageSpec({ ...ok, type: "" })).toContain("PNG");
    });
});
