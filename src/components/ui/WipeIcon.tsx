"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";

// お気に入り・カートの丸ボタンの、ハート・カートの色の入れ替わりを、時計の針が回るように見せる（clock wipe）。
// 下に「オフ」の見た目、上に「オン」の見た目を重ね、上の層だけを、12時から時計回りに現れさせる（追加）、または消していく（外す）。
// 最初の描画では、動かさず、最終の状態で出す。動くのは、状態が変わった時だけ。見た目は globals.css の data-wipe が決める。
const ICONS = { heart: Heart, cart: ShoppingCart } as const;

const COLORS = {
    heart: { on: "text-rose-500 dark:text-rose-400 fill-rose-500", off: "text-outline" },
    cart: { on: "text-blue-600 dark:text-blue-400 fill-blue-100", off: "text-on-surface-subtle" },
} as const;

export default function WipeIcon({ kind, on, className }: { kind: keyof typeof ICONS; on: boolean; className: string }) {
    const Icon = ICONS[kind];
    // 状態が変わった描画で、動きの種類（in: 現れる / out: 消える）を決める。変わるまでは、静止
    const [prevOn, setPrevOn] = useState(on);
    const [motion, setMotion] = useState<"in" | "out" | null>(null);
    if (on !== prevOn) {
        setPrevOn(on);
        setMotion(on ? "in" : "out");
    }
    return (
        <span className={`relative block ${className}`}>
            <Icon className={`absolute inset-0 h-full w-full ${COLORS[kind].off}`} />
            <Icon data-wipe={motion ?? (on ? "on" : "off")} className={`absolute inset-0 h-full w-full ${COLORS[kind].on}`} />
        </span>
    );
}
