"use client";

import { useMemo, useState } from "react";
import type { StickerPack } from "@/lib/stickerPacks";
import type { CreatorProfile } from "@/lib/creatorProfiles";
import { applyPackFilters, EMPTY_FILTERS, type PackFilters } from "@/lib/packFilter";
import StickerPackCard from "@/components/StickerPackCard";
import BulkAddToCartButton from "@/components/BulkAddToCartButton";
import PackFilterPanel from "@/components/PackFilterPanel";

// クリエイターの出品パック。パック名・タグと価格で絞り込める。
// 「全てカートに追加」は、画面に表示されているパック全てが対象（無料のみにしたいときは、先に絞り込む）
export default function CreatorPacks({ packs, creator }: { packs: StickerPack[]; creator: CreatorProfile }) {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<PackFilters>(EMPTY_FILTERS);

    const filtered = useMemo(() => applyPackFilters(packs, query, filters, null), [packs, query, filters]);

    // 絞り込みパネルに出す、カテゴリとタグの候補（このクリエイターのパックから集める）
    const categories = useMemo(() => Array.from(new Set(packs.map((p) => p.category).filter(Boolean))).sort(), [packs]);
    const tags = useMemo(() => Array.from(new Set(packs.flatMap((p) => p.tags))).sort(), [packs]);

    return (
        <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">出品パック</h2>
                {filtered.length > 0 && (
                    <BulkAddToCartButton packs={filtered} label="表示中のパックを全てカートに追加" />
                )}
            </div>

            {packs.length === 0 ? (
                <p className="text-gray-500">出品しているパックはありません</p>
            ) : (
                <>
                    <div className="mb-8 flex flex-col gap-4">
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
                            resultCount={filtered.length}
                            showCreatorFields={false}
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <p className="text-gray-500">条件に一致するパックが見つかりませんでした</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((pack) => (
                                <StickerPackCard key={pack.id} pack={pack} creator={creator} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
