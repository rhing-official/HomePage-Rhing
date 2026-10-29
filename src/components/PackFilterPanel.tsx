"use client";

import { X } from "lucide-react";
import { PRICE_FILTER_OPTIONS, SEARCH_TARGET_OPTIONS, EMPTY_FILTERS, type PackFilters } from "@/lib/packFilter";

const inputClass =
    "w-full px-4 py-2.5 rounded-full bg-white/80 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 transition-colors";

function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition ${
                active
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-white/70 text-primary border-primary/30 hover:bg-primary-container/60"
            }`}
        >
            {children}
        </button>
    );
}

// 絞り込みの条件を、複数同時に選べるパネル。常に表示し、選んだ条件のタグと件数を下に出す
export default function PackFilterPanel({
    filters,
    onChange,
    categories,
    tags,
    resultCount,
    showCreatorFields = true,
}: {
    filters: PackFilters;
    onChange: (next: PackFilters) => void;
    categories: string[];
    tags: string[];
    resultCount: number;
    // クリエイター1人のページでは、Rhing Seed・呼び名の欄は不要なので隠す
    showCreatorFields?: boolean;
}) {
    const set = (patch: Partial<PackFilters>) => onChange({ ...filters, ...patch });

    // 選んだ条件を、消せるタグにして並べる
    const applied: { key: string; label: string; clear: () => void }[] = [
        ...(filters.price !== "all"
            ? [{ key: "price", label: PRICE_FILTER_OPTIONS.find((o) => o.value === filters.price)!.label, clear: () => set({ price: "all" }) }]
            : []),
        ...(filters.seed.trim() ? [{ key: "seed", label: `Rhing Seed: @${filters.seed.trim().replace(/^@+/, "")}`, clear: () => set({ seed: "" }) }] : []),
        ...(filters.nickname.trim() ? [{ key: "nickname", label: `呼び名: ${filters.nickname.trim()}`, clear: () => set({ nickname: "" }) }] : []),
        ...filters.categories.map((c) => ({ key: `c:${c}`, label: c, clear: () => set({ categories: filters.categories.filter((v) => v !== c) }) })),
        ...filters.tags.map((t) => ({ key: `t:${t}`, label: `#${t}`, clear: () => set({ tags: filters.tags.filter((v) => v !== t) }) })),
    ];

    return (
        <div className="flex flex-col gap-3">
            <div className="bg-white/70 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-lg p-5 flex flex-col gap-5">
                <fieldset>
                    <legend className="text-xs font-bold text-gray-500 mb-2">検索する項目</legend>
                    <div className="flex flex-wrap gap-2">
                        {SEARCH_TARGET_OPTIONS.filter((o) => showCreatorFields || o.value !== "creator").map((o) => (
                            <Chip
                                key={o.value}
                                active={filters.searchIn.includes(o.value)}
                                onClick={() => {
                                    const next = toggle(filters.searchIn, o.value) as typeof filters.searchIn;
                                    // 全部外すと検索できなくなるので、見えている項目の最後の1つは外せない
                                    if (next.some((v) => showCreatorFields || v !== "creator")) set({ searchIn: next });
                                }}
                            >
                                {o.label}
                            </Chip>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-xs font-bold text-gray-500 mb-2">価格</legend>
                    <div className="flex flex-wrap gap-2">
                        {PRICE_FILTER_OPTIONS.map((o) => (
                            <Chip key={o.value} active={filters.price === o.value} onClick={() => set({ price: o.value })}>
                                {o.label}
                            </Chip>
                        ))}
                    </div>
                </fieldset>

                {showCreatorFields && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2 text-xs font-bold text-gray-500">
                            Rhing Seed
                            <input
                                value={filters.seed}
                                onChange={(e) => set({ seed: e.target.value })}
                                placeholder="@aaa"
                                className={inputClass}
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-xs font-bold text-gray-500">
                            呼び名
                            <input
                                value={filters.nickname}
                                onChange={(e) => set({ nickname: e.target.value })}
                                placeholder="クリエイターの呼び名"
                                className={inputClass}
                            />
                        </label>
                    </div>
                )}

                {categories.length > 0 && (
                    <fieldset>
                        <legend className="text-xs font-bold text-gray-500 mb-2">カテゴリ（いずれか）</legend>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((c) => (
                                <Chip key={c} active={filters.categories.includes(c)} onClick={() => set({ categories: toggle(filters.categories, c) })}>
                                    {c}
                                </Chip>
                            ))}
                        </div>
                    </fieldset>
                )}

                {tags.length > 0 && (
                    <fieldset>
                        <legend className="text-xs font-bold text-gray-500 mb-2">タグ（全てを含む）</legend>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((t) => (
                                <Chip key={t} active={filters.tags.includes(t)} onClick={() => set({ tags: toggle(filters.tags, t) })}>
                                    #{t}
                                </Chip>
                            ))}
                        </div>
                    </fieldset>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {applied.map((a) => (
                    <button
                        key={a.key}
                        type="button"
                        onClick={a.clear}
                        aria-label={`${a.label}の絞り込みを外す`}
                        className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold hover:brightness-95 transition"
                    >
                        {a.label}
                        <X className="w-3.5 h-3.5" />
                    </button>
                ))}
                {applied.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange(EMPTY_FILTERS)}
                        className="text-xs text-gray-500 hover:text-red-600 underline underline-offset-4 ml-1"
                    >
                        全て解除
                    </button>
                )}
                <p className="text-sm text-gray-500 ml-auto" role="status">
                    {resultCount}件
                </p>
            </div>
        </div>
    );
}
