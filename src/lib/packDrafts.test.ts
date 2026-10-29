import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("@/lib/firebaseStorage", () => ({ deleteStickerPackAssetByUrl: vi.fn() }));
vi.mock("firebase/firestore", () => ({
    collection: vi.fn(), deleteDoc: vi.fn(), doc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), serverTimestamp: vi.fn(), setDoc: vi.fn(), Timestamp: class {},
}));

import { canSaveDraft, removedImageUrls, resolveCoverStickerId } from "./packDrafts";

describe("canSaveDraft", () => {
    it("名前か画像のどちらかがあれば、保存できる", () => {
        expect(canSaveDraft("a", 0)).toBe(true);
        expect(canSaveDraft("", 1)).toBe(true);
        expect(canSaveDraft("  ", 2)).toBe(true);
    });
    it("名前も画像も無ければ、保存できない", () => {
        expect(canSaveDraft("", 0)).toBe(false);
        expect(canSaveDraft("   ", 0)).toBe(false);
    });
});

describe("removedImageUrls", () => {
    it("保存後に無くなった画像だけを返す", () => {
        const before = [{ imageUrl: "u1" }, { imageUrl: "u2" }, { imageUrl: "u3" }];
        const after = [{ imageUrl: "u2" }, { imageUrl: "u4" }];
        expect(removedImageUrls(before, after)).toEqual(["u1", "u3"]);
    });
    it("変わらなければ、空", () => {
        expect(removedImageUrls([{ imageUrl: "u1" }], [{ imageUrl: "u1" }])).toEqual([]);
    });
});

describe("resolveCoverStickerId", () => {
    it("既存のぺったんを選んでいれば、そのID", () => {
        expect(resolveCoverStickerId({ type: "existing", id: "e1" }, [], [])).toBe("e1");
    });
    it("追加予定の画像を選んでいれば、アップロード後の同じ位置のID", () => {
        const f1 = new File(["a"], "a.png");
        const f2 = new File(["b"], "b.png");
        const pending = [{ file: f1 }, { file: f2 }];
        const inputs = [{ stickerId: "n1" }, { stickerId: "n2" }];
        expect(resolveCoverStickerId({ type: "pending", key: f2 }, pending, inputs)).toBe("n2");
    });
    it("アップロード済み（下書きから復元）の画像は、stickerIdで見つける", () => {
        const pending = [{ uploaded: { stickerId: "n1" } }, { uploaded: { stickerId: "n2" } }];
        expect(resolveCoverStickerId({ type: "pending", key: "n1" }, pending, [{ stickerId: "n1" }, { stickerId: "n2" }])).toBe("n1");
    });
    it("見つからなければ、undefined", () => {
        expect(resolveCoverStickerId({ type: "pending", key: "zzz" }, [], [])).toBeUndefined();
    });
});
