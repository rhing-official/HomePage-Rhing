import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebaseFunctions", () => ({ createCheckoutSession: vi.fn() }));
vi.mock("@/lib/stickerPacks", () => ({ isPackOwnedByUser: vi.fn() }));

import { acquireFreePacks, findAcquirableFreePacks } from "./bulkAcquire";
import type { StickerPack } from "@/lib/stickerPacks";

const pack = (id: string, price = 0) => ({ id, price }) as StickerPack;

describe("bulkAcquire", () => {
    it("有料と入手済みを除いて、未入手の無料だけを対象にする", async () => {
        const r = await findAcquirableFreePacks([pack("a"), pack("b"), pack("c", 300)], "u", async (_u, id) => id === "b");
        expect(r.targets.map((p) => p.id)).toEqual(["a"]);
        expect(r.alreadyOwned).toBe(1);
        expect(r.paid).toBe(1);
    });

    it("順番に入手し、結果を集計する", async () => {
        const order: string[] = [];
        const acquire = vi.fn(async (id: string) => {
            order.push(id);
            if (id === "bad") throw new Error("x");
            if (id === "dup") throw { code: "functions/already-exists" };
            return { granted: true };
        });
        const progress = vi.fn();
        const r = await acquireFreePacks(
            [pack("a"), pack("bad"), pack("dup"), pack("z")],
            "u",
            progress,
            { isOwned: async () => false, acquire },
        );
        expect(order).toEqual(["a", "bad", "dup", "z"]);
        expect(r).toEqual({ acquired: ["a", "z"], alreadyOwned: 1, failed: 1, paid: 0 });
        expect(progress).toHaveBeenLastCalledWith(4, 4);
    });

    it("grantedが無い応答は失敗として数える", async () => {
        const r = await acquireFreePacks([pack("a")], "u", undefined, {
            isOwned: async () => false,
            acquire: async () => ({ url: "https://example.com" }),
        });
        expect(r.failed).toBe(1);
        expect(r.acquired).toEqual([]);
    });
});
