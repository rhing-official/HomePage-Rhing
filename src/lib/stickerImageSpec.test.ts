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
    it("対応していない形式は弾く", () => {
        expect(checkImageSpec({ ...ok, type: "image/svg+xml" })).toContain("PNG");
        expect(checkImageSpec({ ...ok, type: "" })).toContain("PNG");
    });
});
