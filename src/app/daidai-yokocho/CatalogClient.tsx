"use client";

import { useEffect, useMemo, useState } from "react";
import type { StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";

type SearchField = "all" | "name" | "nickname" | "id" | "tag";

// プルダウンの表示順は「全て→パック名→呼び名→ID→タグ」の指定順。
const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string; placeholder: string }[] = [
    { value: "all", label: "全て", placeholder: "パック名・タグ・クリエイターで検索" },
    { value: "name", label: "パック名", placeholder: "パック名で検索" },
    { value: "nickname", label: "呼び名", placeholder: "クリエイターの呼び名で検索" },
    { value: "id", label: "ID", placeholder: "クリエイターIDで検索" },
    { value: "tag", label: "タグ", placeholder: "タグで検索" },
];

function matchesField(
    field: SearchField,
    q: string,
    pack: StickerPack,
    creator: CreatorProfile | undefined,
): boolean {
    switch (field) {
        case "name":
            return pack.name.toLowerCase().includes(q);
        case "nickname":
            return (creator?.nickname ?? "").toLowerCase().includes(q);
        case "id":
            return (creator?.rhingId ?? "").toLowerCase().includes(q);
        case "tag":
            return pack.tags.some((tag) => tag.toLowerCase().includes(q));
        case "all":
        default:
            return [pack.name, ...pack.tags, creator?.nickname ?? "", creator?.rhingId ?? ""]
                .join(" ")
                .toLowerCase()
                .includes(q);
    }
}

export default function CatalogClient({ packs }: { packs: StickerPack[] }) {
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile> | null>(null);
    const [query, setQuery] = useState("");
    const [searchField, setSearchField] = useState<SearchField>("all");

    useEffect(() => {
        const creatorIds = packs.map((p) => p.creatorId);
        getCreatorProfiles(creatorIds).then(setCreatorProfiles);
    }, [packs]);

    const filteredPacks = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return packs;
        return packs.filter((pack) =>
            matchesField(searchField, q, pack, creatorProfiles?.get(pack.creatorId)),
        );
    }, [packs, creatorProfiles, query, searchField]);

    const currentOption = SEARCH_FIELD_OPTIONS.find((o) => o.value === searchField)!;

    return (
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-lg mx-auto mb-10 flex flex-col sm:flex-row gap-3">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={currentOption.placeholder}
                    className="flex-1 px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white/90 transition-all duration-300"
                />
                <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value as SearchField)}
                    className="px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-sm font-bold text-gray-600 focus:outline-none focus:border-blue-200 focus:bg-white/90 transition-all duration-300"
                >
                    {SEARCH_FIELD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {filteredPacks.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>{packs.length === 0 ? "横丁に並んでいるパックはありません" : "条件に一致するパックが見つかりませんでした"}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPacks.map((pack) => (
                        <StickerPackCard
                            key={pack.id}
                            pack={pack}
                            creator={creatorProfiles ? (creatorProfiles.get(pack.creatorId) ?? null) : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
