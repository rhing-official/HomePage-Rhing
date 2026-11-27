import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
    collection: vi.fn(), deleteDoc: vi.fn(async () => {}), doc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), serverTimestamp: vi.fn(), setDoc: vi.fn(),
}));
vi.mock("@/lib/themePackReview", () => ({ getThemePack: vi.fn(), isThemePackOwned: vi.fn() }));

import { checkoutDesignCart, classifyThemePack, DESIGN_CART_MAX_ITEMS, selectAddableDesigns } from "./designLists";
import type { PublicThemePack } from "@/lib/themePackReview";

const pack = (id: string, status = "approved", creatorId = "c") => ({ id, status, creatorId }) as PublicThemePack;

describe("classifyThemePack", () => {
    it("公開中は表示する", () => expect(classifyThemePack(pack("a")).state).toBe("ok"));
    it("存在しない・取り下げは消す", () => {
        expect(classifyThemePack(null).state).toBe("gone");
        expect(classifyThemePack(pack("a", "withdrawn")).state).toBe("gone");
    });
    it("配信停止・審査前は、消さずに隠す", () => {
        expect(classifyThemePack(pack("a", "suspended")).state).toBe("hidden");
        expect(classifyThemePack(pack("a", "pending")).state).toBe("hidden");
    });
    it("読めなかった時は、何もしない（消さない）", () => expect(classifyThemePack(null, true).state).toBe("error"));
});

describe("selectAddableDesigns", () => {
    it("取得済み・自分の投稿・カート済みを除く", async () => {
        const r = await selectAddableDesigns(
            [pack("a"), pack("mine", "approved", "u"), pack("inCart"), pack("owned")],
            "u",
            new Set(["inCart"]),
            async (_u, id) => id === "owned",
        );
        expect(r.addable.map((p) => p.id)).toEqual(["a"]);
        expect([r.skippedOwned, r.skippedInCart, r.skippedOwnPack, r.skippedOverLimit]).toEqual([1, 1, 1, 0]);
    });
    it("上限を超える分は追加しない", async () => {
        const inCart = new Set(Array.from({ length: DESIGN_CART_MAX_ITEMS - 1 }, (_, i) => `x${i}`));
        const r = await selectAddableDesigns([pack("a"), pack("b")], "u", inCart, async () => false);
        expect(r.addable.map((p) => p.id)).toEqual(["a"]);
        expect(r.skippedOverLimit).toBe(1);
    });
});

describe("checkoutDesignCart", () => {
    it("成功は取得に数え、失敗は残して数える", async () => {
        const r = await checkoutDesignCart("u", ["a", "b", "c"], async (id) => {
            if (id === "b") throw new Error("x");
            return { alreadyOwned: id === "c" };
        });
        expect(r).toEqual({ acquired: ["a"], alreadyOwned: 1, failed: 1 });
    });
});
