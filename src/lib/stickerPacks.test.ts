import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
    collection: vi.fn(), doc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), limit: vi.fn(), orderBy: vi.fn(),
    query: vi.fn(), where: vi.fn(), Timestamp: class {},
}));

import { getPackCover, type Sticker } from "./stickerPacks";

const st = (stickerId: string) => ({ stickerId, name: stickerId, imageUrl: `u/${stickerId}`, roles: [] }) as Sticker;

describe("getPackCover", () => {
    const stickers = [st("a"), st("b"), st("c")];
    it("coverStickerIdに一致するぺったんを返す", () => {
        expect(getPackCover({ stickers, coverStickerId: "b" })?.stickerId).toBe("b");
    });
    it("未設定のときは、先頭を返す", () => {
        expect(getPackCover({ stickers, coverStickerId: null })?.stickerId).toBe("a");
    });
    it("存在しないIDのときも、先頭を返す", () => {
        expect(getPackCover({ stickers, coverStickerId: "zzz" })?.stickerId).toBe("a");
    });
    it("ぺったんが無いときは、undefined", () => {
        expect(getPackCover({ stickers: [], coverStickerId: null })).toBeUndefined();
    });
});

import { formatPackDate } from "./stickerPacks";

describe("formatPackDate", () => {
    it("年月日を、/で区切って、月日を2桁にそろえる", () => {
        expect(formatPackDate(new Date(2026, 7, 3).getTime())).toBe("2026/08/03");
        expect(formatPackDate(new Date(2026, 11, 25).getTime())).toBe("2026/12/25");
    });
});
