"use client";

import type { ItemKind } from "@/lib/mixedList";

export type KindFilterValue = "all" | ItemKind;

const TABS: { value: KindFilterValue; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "petan", label: "ぺったん" },
    { value: "design", label: "意匠" },
];

// 1つの一覧を、種別で絞る切り替え。件数を添えて、増えても見通せるようにする。「すべて」で、全部を混ぜて見られる
export default function KindFilter({
    value,
    counts,
    onChange,
}: {
    value: KindFilterValue;
    counts: Record<KindFilterValue, number>;
    onChange: (next: KindFilterValue) => void;
}) {
    return (
        <div role="tablist" aria-label="種別で絞る" className="mb-6 inline-flex rounded-full border border-white/80 bg-white/70 p-1 shadow-inner">
            {TABS.map((t) => {
                const active = value === t.value;
                return (
                    <button
                        key={t.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(t.value)}
                        className={`rounded-full px-4 py-2 text-sm font-bold tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            active ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        {t.label}
                        <span className={`ml-1.5 text-xs ${active ? "text-white/80" : "text-gray-400"}`}>{counts[t.value]}</span>
                    </button>
                );
            })}
        </div>
    );
}
