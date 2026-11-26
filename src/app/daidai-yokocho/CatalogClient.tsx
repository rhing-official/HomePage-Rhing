"use client";

import { useEffect, useMemo, useState } from "react";
import type { StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";
import BulkAddToCartButton from "@/components/BulkAddToCartButton";
import PackFilterPanel from "@/components/PackFilterPanel";
import KindSwitch, { type CatalogKind } from "@/components/daidai-yokocho/KindSwitch";
import DesignCatalog from "@/components/daidai-yokocho/DesignCatalog";
import { applyPackFilters, EMPTY_FILTERS, type PackFilters } from "@/lib/packFilter";

export default function CatalogClient({ packs, initialKind = "petan" }: { packs: StickerPack[]; initialKind?: CatalogKind }) {
    const [kind, setKind] = useState<CatalogKind>(initialKind);
    // 意匠の側は、初めて開いた時に読み込み、以後は表示を隠すだけにする（切り替えるたびに読み込み直さない）
    const [designOpened, setDesignOpened] = useState(initialKind === "design");
    // 切り替えを、URLにも残す（?kind=design）。再読み込みや共有で、同じ側が開く。ページの再取得はしない
    const switchKind = (next: CatalogKind) => {
        if (next === "design") setDesignOpened(true);
        setKind(next);
        const url = new URL(window.location.href);
        if (next === "design") url.searchParams.set("kind", "design");
        else url.searchParams.delete("kind");
        window.history.replaceState(null, "", url);
    };
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
            <KindSwitch value={kind} onChange={switchKind} />

            {designOpened && (
                <div hidden={kind !== "design"}>
                    <DesignCatalog />
                </div>
            )}
            <div hidden={kind !== "petan"}>
                <>
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
                    <p>{packs.length === 0 ? "横丁に並んでいるパックは有りません" : "条件に一致するパックが見つかりませんでした"}</p>
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
                </>
            </div>
        </div>
    );
}
