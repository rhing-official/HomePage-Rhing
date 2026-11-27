"use client";

import {
    DESIGN_APPEARANCE_OPTIONS,
    DESIGN_SEARCH_TARGET_OPTIONS,
    type DesignFilters,
} from "@/lib/designFilter";
import { Chip, inputClass, toggle } from "@/components/PackFilterPanel";

// 意匠の絞り込みパネル。ぺったんのPackFilterPanelと同じ見た目で、項目だけが違う
export default function DesignFilterPanel({ filters, onChange }: { filters: DesignFilters; onChange: (next: DesignFilters) => void }) {
    const set = (patch: Partial<DesignFilters>) => onChange({ ...filters, ...patch });
    return (
        <div className="bg-surface-container-lowest/70 backdrop-blur-md border border-glass-edge/80 shadow-elevation-1 rounded-m3-lg p-5 flex flex-col gap-5">
            <fieldset>
                <legend className="text-xs font-bold text-on-surface-subtle mb-2">検索する項目</legend>
                <div className="flex flex-wrap gap-2">
                    {DESIGN_SEARCH_TARGET_OPTIONS.map((o) => (
                        <Chip
                            key={o.value}
                            active={filters.searchIn.includes(o.value)}
                            onClick={() => {
                                const next = toggle(filters.searchIn, o.value) as typeof filters.searchIn;
                                // 全部外すと検索できなくなるので、最後の1つは外せない
                                if (next.length > 0) set({ searchIn: next });
                            }}
                        >
                            {o.label}
                        </Chip>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className="text-xs font-bold text-on-surface-subtle mb-2">外観</legend>
                <div className="flex flex-wrap gap-2">
                    {DESIGN_APPEARANCE_OPTIONS.map((o) => (
                        <Chip key={o.value} active={filters.appearance === o.value} onClick={() => set({ appearance: o.value })}>
                            {o.label}
                        </Chip>
                    ))}
                </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-xs font-bold text-on-surface-subtle">
                    Rhing Seed
                    <input value={filters.seed} onChange={(e) => set({ seed: e.target.value })} placeholder="@aaa" className={inputClass} />
                </label>
                <label className="flex flex-col gap-2 text-xs font-bold text-on-surface-subtle">
                    呼び名
                    <input value={filters.nickname} onChange={(e) => set({ nickname: e.target.value })} placeholder="クリエイターの呼び名" className={inputClass} />
                </label>
            </div>
        </div>
    );
}
