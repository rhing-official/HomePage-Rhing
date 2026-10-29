import type { StickerPack } from "@/lib/stickerPacks";
import type { CreatorProfile } from "@/lib/creatorProfiles";

export type PriceFilter = "all" | "free" | "paid";

export const PRICE_FILTER_OPTIONS: { value: PriceFilter; label: string }[] = [
    { value: "all", label: "全ての価格" },
    { value: "free", label: "無料のみ" },
    { value: "paid", label: "有料のみ" },
];

export function matchesPrice(filter: PriceFilter, pack: Pick<StickerPack, "price">): boolean {
    if (filter === "free") return pack.price === 0;
    if (filter === "paid") return pack.price > 0;
    return true;
}

// 絞り込みパネルの条件。全て「かつ」で組み合わせる
export interface PackFilters {
    price: PriceFilter;
    seed: string; // クリエイターのRhing Seed（部分一致、先頭の@は無視）
    nickname: string; // クリエイターの呼び名（部分一致）
    categories: string[]; // いずれかに一致（空なら絞らない）
    tags: string[]; // 全てを含む（空なら絞らない）
    searchIn: SearchTarget[]; // 検索語を当てる項目（いずれかに一致。初期値は全て）
}

export type SearchTarget = "name" | "tag" | "creator";

export const SEARCH_TARGET_OPTIONS: { value: SearchTarget; label: string }[] = [
    { value: "name", label: "パック名" },
    { value: "tag", label: "タグ" },
    { value: "creator", label: "クリエイター" },
];

export const EMPTY_FILTERS: PackFilters = {
    price: "all",
    seed: "",
    nickname: "",
    categories: [],
    tags: [],
    searchIn: ["name", "tag", "creator"],
};

export function countActiveFilters(f: PackFilters): number {
    return (
        (f.price !== "all" ? 1 : 0) +
        (f.seed.trim() ? 1 : 0) +
        (f.nickname.trim() ? 1 : 0) +
        f.categories.length +
        f.tags.length
    );
}

const norm = (v: string) => v.trim().toLowerCase();

// 検索語（パック名・タグ・クリエイターを横断）と、絞り込みの条件を、全て満たすパックを返す
export function applyPackFilters(
    packs: StickerPack[],
    query: string,
    filters: PackFilters,
    creators: ReadonlyMap<string, CreatorProfile> | null,
): StickerPack[] {
    const q = norm(query);
    const seed = norm(filters.seed).replace(/^@+/, "");
    const nickname = norm(filters.nickname);

    return packs.filter((pack) => {
        const creator = creators?.get(pack.creatorId);
        if (!matchesPrice(filters.price, pack)) return false;
        if (filters.categories.length > 0 && !filters.categories.includes(pack.category)) return false;
        if (filters.tags.length > 0 && !filters.tags.every((t) => pack.tags.includes(t))) return false;
        if (seed && !norm(creator?.rhingSeed ?? "").includes(seed)) return false;
        if (nickname && !norm(creator?.nickname ?? "").includes(nickname)) return false;
        if (q) {
            const targets = filters.searchIn.length > 0 ? filters.searchIn : EMPTY_FILTERS.searchIn;
            const texts = [
                ...(targets.includes("name") ? [pack.name] : []),
                ...(targets.includes("tag") ? pack.tags : []),
                ...(targets.includes("creator") ? [creator?.nickname ?? "", creator?.rhingSeed ?? ""] : []),
            ];
            if (!texts.join(" ").toLowerCase().includes(q)) return false;
        }
        return true;
    });
}
