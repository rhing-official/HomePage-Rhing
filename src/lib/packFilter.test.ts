import { describe, expect, it } from "vitest";
import { matchesPrice } from "./packFilter";

describe("matchesPrice", () => {
    it("全て: 無料も有料も通す", () => {
        expect(matchesPrice("all", { price: 0 })).toBe(true);
        expect(matchesPrice("all", { price: 300 })).toBe(true);
    });
    it("無料のみ: 価格0だけ通す", () => {
        expect(matchesPrice("free", { price: 0 })).toBe(true);
        expect(matchesPrice("free", { price: 300 })).toBe(false);
    });
    it("有料のみ: 価格が0より大きいものだけ通す", () => {
        expect(matchesPrice("paid", { price: 0 })).toBe(false);
        expect(matchesPrice("paid", { price: 300 })).toBe(true);
    });
});

import { applyPackFilters, countActiveFilters, EMPTY_FILTERS } from "./packFilter";
import type { StickerPack } from "@/lib/stickerPacks";
import type { CreatorProfile } from "@/lib/creatorProfiles";

const pk = (id: string, o: Partial<StickerPack> = {}) =>
    ({ id, name: id, price: 0, creatorId: "c1", category: "", tags: [], ...o }) as StickerPack;
const creators = new Map<string, CreatorProfile>([
    ["c1", { userId: "c1", rhingSeed: "aaa", nickname: "あらじい" } as CreatorProfile],
    ["c2", { userId: "c2", rhingSeed: "bbb", nickname: "ぼぼ" } as CreatorProfile],
]);

describe("applyPackFilters", () => {
    const packs = [
        pk("a", { price: 0, creatorId: "c1", tags: ["猫", "犬"], category: "動物" }),
        pk("b", { price: 300, creatorId: "c1", tags: ["猫"], category: "動物" }),
        pk("c", { price: 0, creatorId: "c2", tags: ["猫"], category: "食べ物" }),
    ];
    const ids = (r: StickerPack[]) => r.map((p) => p.id);

    it("条件なしなら、全て", () => {
        expect(ids(applyPackFilters(packs, "", EMPTY_FILTERS, creators))).toEqual(["a", "b", "c"]);
    });
    it("価格とRhing Seedを同時に指定できる（かつ）", () => {
        const f = { ...EMPTY_FILTERS, price: "free" as const, seed: "@aaa" };
        expect(ids(applyPackFilters(packs, "", f, creators))).toEqual(["a"]);
    });
    it("タグは、指定した全てを含むものだけ", () => {
        expect(ids(applyPackFilters(packs, "", { ...EMPTY_FILTERS, tags: ["猫", "犬"] }, creators))).toEqual(["a"]);
    });
    it("カテゴリは、いずれかに一致", () => {
        expect(ids(applyPackFilters(packs, "", { ...EMPTY_FILTERS, categories: ["食べ物"] }, creators))).toEqual(["c"]);
    });
    it("検索語は、パック名・タグ・クリエイターを横断する", () => {
        expect(ids(applyPackFilters(packs, "ぼぼ", EMPTY_FILTERS, creators))).toEqual(["c"]);
    });
    it("クリエイター情報が未取得でも、Seed指定は一致なしになる", () => {
        expect(applyPackFilters(packs, "", { ...EMPTY_FILTERS, seed: "aaa" }, null)).toEqual([]);
    });
    it("有効な条件の数を数える", () => {
        expect(countActiveFilters({ ...EMPTY_FILTERS, price: "free", seed: "x", categories: ["a", "b"] })).toBe(4);
    });
    it("検索対象を絞ると、その項目だけに検索語を当てる", () => {
        const onlyName = { ...EMPTY_FILTERS, searchIn: ["name" as const] };
        expect(ids(applyPackFilters(packs, "猫", onlyName, creators))).toEqual([]);
        const onlyTag = { ...EMPTY_FILTERS, searchIn: ["tag" as const] };
        expect(ids(applyPackFilters(packs, "猫", onlyTag, creators))).toEqual(["a", "b", "c"]);
        expect(ids(applyPackFilters(packs, "ぼぼ", onlyTag, creators))).toEqual([]);
    });
    it("検索対象が空のときは、全てを対象にする", () => {
        expect(ids(applyPackFilters(packs, "ぼぼ", { ...EMPTY_FILTERS, searchIn: [] }, creators))).toEqual(["c"]);
    });
});
