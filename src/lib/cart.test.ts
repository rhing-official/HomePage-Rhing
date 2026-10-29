import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
    collection: vi.fn(), deleteDoc: vi.fn(), doc: vi.fn(), getDocs: vi.fn(), serverTimestamp: vi.fn(), setDoc: vi.fn(), writeBatch: vi.fn(),
}));
vi.mock("@/lib/stickerPacks", () => ({ getStickerPackById: vi.fn(), isPackOwnedByUser: vi.fn() }));
vi.mock("@/lib/bulkAcquire", () => ({ acquireFreePacks: vi.fn() }));

import { CART_MAX_ITEMS, checkoutCart, selectAddableToCart } from "./cart";
import type { StickerPack } from "@/lib/stickerPacks";

const pack = (id: string, price = 0, creatorId = "c") => ({ id, price, creatorId }) as StickerPack;

describe("selectAddableToCart", () => {
    it("入手済み・自分の出品・カート済みを除く", async () => {
        const { addable, summary } = await selectAddableToCart(
            [pack("a"), pack("b"), pack("mine", 0, "u"), pack("inCart"), pack("owned")],
            "u",
            new Set(["inCart"]),
            async (_u, id) => id === "owned",
        );
        expect(addable.map((p) => p.id)).toEqual(["a", "b"]);
        expect(summary).toEqual({ skippedOwned: 1, skippedInCart: 1, skippedOwnPack: 1, skippedOverLimit: 0 });
    });

    it("上限を超える分は追加しない", async () => {
        const inCart = new Set(Array.from({ length: CART_MAX_ITEMS - 1 }, (_, i) => `x${i}`));
        const { addable, summary } = await selectAddableToCart([pack("a"), pack("b"), pack("c2")], "u", inCart, async () => false);
        expect(addable.map((p) => p.id)).toEqual(["a"]);
        expect(summary.skippedOverLimit).toBe(2);
    });

    it("有料パックも、カートには入れられる", async () => {
        const { addable } = await selectAddableToCart([pack("paid", 300)], "u", new Set(), async () => false);
        expect(addable.map((p) => p.id)).toEqual(["paid"]);
    });
});

describe("checkoutCart", () => {
    it("入手に成功したものだけをカートから外す", async () => {
        const remove = vi.fn(async () => {});
        const acquire = vi.fn(async () => ({ acquired: ["a"], alreadyOwned: 0, failed: 1, paid: 1 }));
        const r = await checkoutCart([pack("a"), pack("b"), pack("p", 300)], "u", undefined, remove, acquire);
        expect(remove).toHaveBeenCalledTimes(1);
        expect(remove).toHaveBeenCalledWith("u", "a");
        expect(r.removedFromCart).toEqual(["a"]);
        expect(r.paid).toBe(1);
        expect(r.failed).toBe(1);
    });
});
