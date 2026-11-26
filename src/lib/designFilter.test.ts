import { describe, expect, it } from "vitest";
import type { CreatorProfile } from "@/lib/creatorProfiles";
import { applyDesignFilters, countActiveDesignFilters, EMPTY_DESIGN_FILTERS, matchesAppearance } from "./designFilter";

const creators = new Map<string, CreatorProfile>([
    ["u1", { userId: "u1", nickname: "さくら", rhingSeed: "sakura1" } as CreatorProfile],
    ["u2", { userId: "u2", nickname: "よる", rhingSeed: "yoru2" } as CreatorProfile],
]);
const packs = [
    { name: "桜", creatorId: "u1", brightness: "light" },
    { name: "夜", creatorId: "u2", brightness: "dark" },
    { name: "水玉", creatorId: "u1", brightness: "both" },
];

describe("matchesAppearance", () => {
    it("全てなら全部残す", () => expect(matchesAppearance("all", "dark")).toBe(true));
    it("明るいは、明るいだけと両対応を残す", () => {
        expect(matchesAppearance("light", "light")).toBe(true);
        expect(matchesAppearance("light", "both")).toBe(true);
        expect(matchesAppearance("light", "dark")).toBe(false);
    });
    it("暗いは、暗いだけと両対応を残す", () => {
        expect(matchesAppearance("dark", "dark")).toBe(true);
        expect(matchesAppearance("dark", "both")).toBe(true);
        expect(matchesAppearance("dark", "light")).toBe(false);
    });
});

describe("applyDesignFilters", () => {
    it("条件なしは全部", () => expect(applyDesignFilters(packs, "", EMPTY_DESIGN_FILTERS, creators)).toHaveLength(3));
    it("意匠名で検索", () => expect(applyDesignFilters(packs, "桜", EMPTY_DESIGN_FILTERS, creators).map((p) => p.name)).toEqual(["桜"]));
    it("クリエイターの呼び名でも検索", () => expect(applyDesignFilters(packs, "さくら", EMPTY_DESIGN_FILTERS, creators)).toHaveLength(2));
    it("検索の項目を意匠名だけにすると、呼び名では当たらない", () =>
        expect(applyDesignFilters(packs, "さくら", { ...EMPTY_DESIGN_FILTERS, searchIn: ["name"] }, creators)).toHaveLength(0));
    it("外観で絞る", () =>
        expect(applyDesignFilters(packs, "", { ...EMPTY_DESIGN_FILTERS, appearance: "dark" }, creators).map((p) => p.name)).toEqual(["夜", "水玉"]));
    it("Rhing Seedは、先頭の@を無視して部分一致", () =>
        expect(applyDesignFilters(packs, "", { ...EMPTY_DESIGN_FILTERS, seed: "@yoru" }, creators).map((p) => p.name)).toEqual(["夜"]));
    it("呼び名で絞る", () =>
        expect(applyDesignFilters(packs, "", { ...EMPTY_DESIGN_FILTERS, nickname: "さく" }, creators)).toHaveLength(2));
    it("複数の条件は、かつ", () =>
        expect(applyDesignFilters(packs, "", { ...EMPTY_DESIGN_FILTERS, nickname: "さくら", appearance: "dark" }, creators).map((p) => p.name)).toEqual(["水玉"]));
});

describe("countActiveDesignFilters", () => {
    it("数える", () => {
        expect(countActiveDesignFilters(EMPTY_DESIGN_FILTERS)).toBe(0);
        expect(countActiveDesignFilters({ ...EMPTY_DESIGN_FILTERS, appearance: "light", seed: "a" })).toBe(2);
    });
});
