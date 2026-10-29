import { describe, expect, it, vi } from "vitest";

const upload = vi.fn(async () => "https://example.com/new.png");
vi.mock("@/lib/firebaseStorage", () => ({ uploadStickerPackAsset: (...a: unknown[]) => upload(...(a as [])) }));
vi.mock("@/lib/firebaseFunctions", () => ({}));

import { uploadFiles, draftEntryId, type StickerDraft } from "./StickerImagePicker";

describe("uploadFiles", () => {
    it("アップロード済みの画像は、再アップロードせず、役割だけ更新して通す", async () => {
        upload.mockClear();
        const entries: StickerDraft[] = [
            { uploaded: { stickerId: "s1", name: "a", imageUrl: "https://example.com/a.png", roles: [] }, roles: ["r1"] },
        ];
        const r = await uploadFiles("u", entries);
        expect(upload).not.toHaveBeenCalled();
        expect(r).toEqual([{ stickerId: "s1", name: "a", imageUrl: "https://example.com/a.png", roles: ["r1"] }]);
    });
    it("新規の画像だけアップロードする（順序は保つ）", async () => {
        upload.mockClear();
        const file = new File(["x"], "pic.png", { type: "image/png" });
        const entries: StickerDraft[] = [
            { uploaded: { stickerId: "s1", name: "a", imageUrl: "u1", roles: [] }, roles: [] },
            { file, roles: [] },
        ];
        const r = await uploadFiles("u", entries);
        expect(upload).toHaveBeenCalledTimes(1);
        expect(r.map((s) => s.name)).toEqual(["a", "pic"]);
        expect(r[1].imageUrl).toBe("https://example.com/new.png");
    });
});

describe("draftEntryId", () => {
    it("役割を変えても同じ画像と判定できる（File、またはstickerId）", () => {
        const file = new File(["x"], "pic.png");
        expect(draftEntryId({ file, roles: [] })).toBe(draftEntryId({ file, roles: ["r"] }));
        expect(draftEntryId({ uploaded: { stickerId: "s", name: "n", imageUrl: "u", roles: [] }, roles: [] })).toBe("s");
    });
});
