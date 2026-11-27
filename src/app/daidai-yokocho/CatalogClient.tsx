"use client";

import { X } from "lucide-react";
import { useCatalogKind } from "@/hooks/useCatalogKind";
import { useEffect, useMemo, useState } from "react";
import type { StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";
import BulkAddToCartButton from "@/components/BulkAddToCartButton";
import PackFilterPanel from "@/components/PackFilterPanel";
import DesignFilterPanel from "@/components/DesignFilterPanel";
import { countActiveDesignFilters, EMPTY_DESIGN_FILTERS, type DesignFilters } from "@/lib/designFilter";
import KindSwitch, { type CatalogKind } from "@/components/daidai-yokocho/KindSwitch";
import DesignCatalog from "@/components/daidai-yokocho/DesignCatalog";
import BulkAddDesignsButton from "@/components/daidai-yokocho/BulkAddDesignsButton";
import type { PublicThemePack } from "@/lib/themePackReview";
import { applyPackFilters, countActiveFilters, EMPTY_FILTERS, type PackFilters } from "@/lib/packFilter";

// initialKind: URLに?kind=が有る時だけ渡る。無ければ、前に開いていた側（詳細ページから戻った時など）を使う
export default function CatalogClient({ packs, initialKind }: { packs: StickerPack[]; initialKind?: CatalogKind }) {
    const [kind, setKind] = useCatalogKind(initialKind);
    // 意匠の側は、初めて開いた時に読み込み、以後は表示を隠すだけにする（切り替えるたびに読み込み直さない）
    const [designVisited, setDesignOpened] = useState(false);
    const designOpened = designVisited || kind === "design";
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
    // 意匠の側で、今の検索に合う件数（読み込み前はnull）
    const [designFilters, setDesignFilters] = useState<DesignFilters>(EMPTY_DESIGN_FILTERS);
    const designActive = countActiveDesignFilters(designFilters);
    const [designCount, setDesignCount] = useState<number | null>(null);
    // 表示中の意匠（「全てカートに追加」の対象）
    const [shownDesigns, setShownDesigns] = useState<PublicThemePack[]>([]);

    useEffect(() => {
        const creatorIds = packs.map((p) => p.creatorId);
        getCreatorProfiles(creatorIds).then(setCreatorProfiles);
    }, [packs]);

    const filteredPacks = useMemo(
        () => applyPackFilters(packs, query, filters, creatorProfiles),
        [packs, creatorProfiles, query, filters],
    );

    const activeFilterCount = countActiveFilters(filters);

    // 絞り込みパネルに出す、カテゴリとタグの候補（今あるぺったんから集める）
    const categories = useMemo(() => Array.from(new Set(packs.map((p) => p.category).filter(Boolean))).sort(), [packs]);
    const tags = useMemo(() => Array.from(new Set(packs.flatMap((p) => p.tags))).sort(), [packs]);

    return (
        <div className="container mx-auto px-6 max-w-6xl">
            {/* 切り替えと検索を、同じ行に置く。左右の端は、下のカードの一覧に揃える。絞り込みは、検索欄に触れた時に、下へ重ねて開く（ぺったんを隠さないため） */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <KindSwitch value={kind} onChange={switchKind} className="sm:mx-0 shrink-0" />
                <div className="group relative flex-1">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="検索"
                        aria-label="検索"
                        className="h-12 w-full pl-5 pr-11 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white/90 transition-all duration-300"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="検索の文字を消す"
                            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <div className="absolute left-0 top-full z-30 hidden w-full max-w-2xl pt-2 group-hover:block group-focus-within:block">
                        <div className="max-h-[70vh] overflow-y-auto rounded-m3-lg bg-white shadow-2xl">
                            {kind === "petan" ? (
                                <PackFilterPanel
                                    showSummary={false}
                                    filters={filters}
                                    onChange={setFilters}
                                    categories={categories}
                                    tags={tags}
                                    resultCount={filteredPacks.length}
                                />
                            ) : (
                                <DesignFilterPanel filters={designFilters} onChange={setDesignFilters} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 説明と、結果の状態を、1行にまとめる。文は、切り替えても行の高さが変わらないよう、1行に収める */}
            <div className="mb-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <p className="text-sm text-gray-500">
                    {kind === "petan" ? "DaiDaiで使えるぺったんを探せます。" : "DaiDaiの色・形・背景を着せ替える意匠を探せます。"}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2" role="status">
                    {kind === "petan" ? (
                        <>
                            {(query.trim() !== "" || activeFilterCount > 0) && (
                                <span className="text-sm text-gray-500">
                                    {filteredPacks.length}件{activeFilterCount > 0 ? `　絞り込み${activeFilterCount}件を適用中` : ""}
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setFilters(EMPTY_FILTERS)}
                                            className="ml-3 text-xs underline underline-offset-4 hover:text-red-600"
                                        >
                                            全て解除
                                        </button>
                                    )}
                                </span>
                            )}
                            {filteredPacks.length > 0 && (
                                <BulkAddToCartButton packs={filteredPacks} label="表示中のぺったんを全てカートに追加" />
                            )}
                        </>
                    ) : (
                        <>
                        {designCount !== null && (query.trim() !== "" || designActive > 0) && (
                            <span className="text-sm text-gray-500">
                                {designCount}件{designActive > 0 ? `　絞り込み${designActive}件を適用中` : ""}
                                {designActive > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setDesignFilters(EMPTY_DESIGN_FILTERS)}
                                        className="ml-3 text-xs underline underline-offset-4 hover:text-red-600"
                                    >
                                        全て解除
                                    </button>
                                )}
                            </span>
                        )}
                        {shownDesigns.length > 0 && (
                            <BulkAddDesignsButton packs={shownDesigns} label="表示中の意匠を全てカートに追加" />
                        )}
                        </>
                    )}
                </div>
            </div>

            {designOpened && (
                <div hidden={kind !== "design"}>
                    <DesignCatalog query={query} filters={designFilters} onCount={setDesignCount} onShown={setShownDesigns} />
                </div>
            )}
            <div hidden={kind !== "petan"}>
                <>
            {filteredPacks.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>{packs.length === 0 ? "横丁に並んでいるぺったんは有りません" : "条件に一致するぺったんが見つかりませんでした"}</p>
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
