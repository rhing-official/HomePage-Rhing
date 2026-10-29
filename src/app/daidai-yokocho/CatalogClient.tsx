"use client";

import { useEffect, useMemo, useState } from "react";
import type { StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";
import BulkAddToCartButton from "@/components/BulkAddToCartButton";
import PackFilterPanel from "@/components/PackFilterPanel";
import { applyPackFilters, EMPTY_FILTERS, type PackFilters } from "@/lib/packFilter";

export default function CatalogClient({ packs }: { packs: StickerPack[] }) {
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile> | null>(null);
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<PackFilters>(EMPTY_FILTERS);

    useEffect(() => {
        const creatorIds = packs.map((p) => p.creatorId);
        getCreatorProfiles(creatorIds).then(setCreatorProfiles);
    }, [packs]);

    const filteredPacks = useMemo(
        () => applyPackFilters(packs, query, filters, creatorProfiles),
        [packs, creatorProfiles, query, filters],
    );

    // 絞り込みパネルに出す、カテゴリとタグの候補（今あるパックから集める）
    const categories = useMemo(() => Array.from(new Set(packs.map((p) => p.category).filter(Boolean))).sort(), [packs]);
    const tags = useMemo(() => Array.from(new Set(packs.flatMap((p) => p.tags))).sort(), [packs]);

    return (
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-2xl mx-auto mb-10 flex flex-col gap-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="検索"
                    className="w-full px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white/90 transition-all duration-300"
                />
                <PackFilterPanel
                    filters={filters}
                    onChange={setFilters}
                    categories={categories}
                    tags={tags}
                    resultCount={filteredPacks.length}
                />
            </div>

            {filteredPacks.length > 0 && (
                <div className="mb-6 flex justify-end">
                    <BulkAddToCartButton
                        packs={filteredPacks}
                        label="表示中のパックを全てカートに追加"
                    />
                </div>
            )}

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
