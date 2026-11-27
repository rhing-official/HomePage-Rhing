import type { CreatorProfile } from "@/lib/creatorProfiles";

// 意匠の絞り込み（ぺったんのpackFilter.tsに対応する）。全て「かつ」で組み合わせる。
// 価格は、今は全て無料なので、項目に出さない。

export type DesignAppearance = "all" | "light" | "dark";
export type DesignSearchTarget = "name" | "creator";

export interface DesignFilters {
    /** 対応する外観。「明るい」は明るいだけと両対応、「暗い」は暗いだけと両対応を残す */
    appearance: DesignAppearance;
    seed: string;
    nickname: string;
    /** 検索語を当てる項目（いずれかに一致） */
    searchIn: DesignSearchTarget[];
}

export const EMPTY_DESIGN_FILTERS: DesignFilters = {
    appearance: "all",
    seed: "",
    nickname: "",
    searchIn: ["name", "creator"],
};

export const DESIGN_APPEARANCE_OPTIONS: { value: DesignAppearance; label: string }[] = [
    { value: "all", label: "全ての外観" },
    { value: "light", label: "明るい外観に対応" },
    { value: "dark", label: "暗い外観に対応" },
];

export const DESIGN_SEARCH_TARGET_OPTIONS: { value: DesignSearchTarget; label: string }[] = [
    { value: "name", label: "意匠名" },
    { value: "creator", label: "クリエイター" },
];

export function countActiveDesignFilters(f: DesignFilters): number {
    return (f.appearance !== "all" ? 1 : 0) + (f.seed.trim() ? 1 : 0) + (f.nickname.trim() ? 1 : 0);
}

export interface FilterableDesign {
    name: string;
    creatorId: string;
    brightness: string;
}

const norm = (v: string) => v.trim().toLowerCase();

export function matchesAppearance(filter: DesignAppearance, brightness: string): boolean {
    if (filter === "all") return true;
    return brightness === "both" || brightness === filter;
}

export function applyDesignFilters<T extends FilterableDesign>(
    packs: T[],
    query: string,
    filters: DesignFilters,
    creators: ReadonlyMap<string, CreatorProfile> | null,
): T[] {
    const q = norm(query);
    const seed = norm(filters.seed).replace(/^@+/, "");
    const nickname = norm(filters.nickname);
    return packs.filter((pack) => {
        const creator = creators?.get(pack.creatorId);
        if (!matchesAppearance(filters.appearance, pack.brightness)) return false;
        if (seed && !norm(creator?.rhingSeed ?? "").includes(seed)) return false;
        if (nickname && !norm(creator?.nickname ?? "").includes(nickname)) return false;
        if (q) {
            const targets = filters.searchIn.length > 0 ? filters.searchIn : EMPTY_DESIGN_FILTERS.searchIn;
            const texts = [
                ...(targets.includes("name") ? [pack.name] : []),
                ...(targets.includes("creator") ? [creator?.nickname ?? "", creator?.rhingSeed ?? ""] : []),
            ];
            if (!texts.join(" ").toLowerCase().includes(q)) return false;
        }
        return true;
    });
}
