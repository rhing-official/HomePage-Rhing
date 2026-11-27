"use client";

import { useCallback, useState } from "react";
import { Check } from "lucide-react";

// 一覧（お気に入り・カート）で、複数を選んで、まとめて外すための部品。
// 項目ごとにチェックボックスを、最初から置く。項目そのもの（リンク）は、今までどおり押せる。

export function useSelection() {
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);
    const selectAll = useCallback((ids: string[]) => setSelected(new Set(ids)), []);
    const clear = useCallback(() => setSelected(new Set()), []);

    return { selected, toggle, selectAll, clear };
}

function Box({ checked, onChange, label, className = "" }: { checked: boolean; onChange: () => void; label: string; className?: string }) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={label}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange();
            }}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                checked ? "border-blue-600 bg-blue-600 text-white" : "border-outline bg-surface-container-lowest/90 text-transparent hover:border-blue-500"
            } ${className}`}
        >
            <Check className="h-4 w-4" aria-hidden />
        </button>
    );
}

export function SelectionToolbar({
    ids,
    selected,
    busy = false,
    actionLabel,
    onSelectAll,
    onClear,
    onAction,
    trailing,
}: {
    /** 今、一覧に出ている項目のid */
    ids: string[];
    selected: ReadonlySet<string>;
    busy?: boolean;
    /** 例:「お気に入りから外す」 */
    actionLabel: string;
    onSelectAll: (ids: string[]) => void;
    onClear: () => void;
    onAction: (selectedIds: string[]) => void;
    /** 外すボタンの右に、同じ高さで並べるもの。例:「まとめて入手」 */
    trailing?: React.ReactNode;
}) {
    if (ids.length === 0) return null;
    // 一覧から消えた項目は、選択に数えない
    const chosen = ids.filter((id) => selected.has(id));
    const all = chosen.length === ids.length;

    return (
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Box checked={all} onChange={() => (all ? onClear() : onSelectAll(ids))} label="全て選択" />
                全て選択
            </label>
            <span className="text-sm text-on-surface-subtle" role="status">
                {chosen.length > 0 ? `${chosen.length}件を選択中` : ""}
            </span>
            <span className="flex-1" />
            <button
                type="button"
                onClick={() => onAction(chosen)}
                disabled={busy || chosen.length === 0}
                className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {busy ? "処理中…" : `${actionLabel}（${chosen.length}件）`}
            </button>
            {trailing}
        </div>
    );
}

// layout="overlay": カードの左上にチェックボックスを重ねる / "inline": 行の左端に並べる
export function SelectableItem({
    selected,
    onToggle,
    label,
    layout = "overlay",
    badge,
    className = "",
    as: Tag = "div",
    children,
}: {
    selected: boolean;
    onToggle: () => void;
    /** 読み上げ用。項目の名前 */
    label: string;
    layout?: "overlay" | "inline";
    /** layout="overlay"の時、チェックボックスの隣に出すもの。例: 種別のバッジ */
    badge?: React.ReactNode;
    className?: string;
    /** 一覧が<ul>の時は"li" */
    as?: "div" | "li";
    children: React.ReactNode;
}) {
    if (layout === "inline") {
        return (
            <Tag className={`${className} ${selected ? "ring-2 ring-blue-600" : ""}`}>
                <Box checked={selected} onChange={onToggle} label={`${label}を選択`} className="ml-1" />
                {children}
            </Tag>
        );
    }
    return (
        <Tag className={`relative rounded-m3-lg ${selected ? "ring-2 ring-blue-600" : ""} ${className}`}>
            {children}
            <Box checked={selected} onChange={onToggle} label={`${label}を選択`} className="absolute left-3 top-3 z-10 shadow-sm" />
            {badge && <span className="pointer-events-none absolute left-11 top-3 z-10 flex h-6 items-center">{badge}</span>}
        </Tag>
    );
}
