import type { ItemKind } from "@/lib/mixedList";

const META: Record<ItemKind, { label: string; className: string }> = {
    petan: { label: "ぺったん", className: "bg-amber-100 text-amber-700" },
    design: { label: "意匠", className: "bg-indigo-100 text-indigo-700" },
};

// お気に入りとカートの、ぺったんと意匠を混ぜた一覧で、種別を見分ける小さなバッジ
export default function KindBadge({ kind, className = "" }: { kind: ItemKind; className?: string }) {
    const m = META[kind];
    return <span className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${m.className} ${className}`}>{m.label}</span>;
}
