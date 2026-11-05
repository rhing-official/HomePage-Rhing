"use client";

import { usePathname } from "next/navigation";

// ページの背景に散らす水玉。ページごとに決まった並びにして（乱数の種をパスから作る）、
// サーバーとクライアントで同じ結果になるようにする（ハイドレーションの不一致を避ける）。
const DOT_COUNT = 44;
const AREA_HEIGHT_PX = 5200; // これより下は、ページの範囲で切り抜かれる

function hashString(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

// mulberry32: 種から0以上1未満の乱数を出す
function createRandom(seed: number): () => number {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function makeDots(seed: number) {
    const random = createRandom(seed);
    return Array.from({ length: DOT_COUNT }, () => ({
        left: random() * 100,
        top: random() * AREA_HEIGHT_PX,
        size: 28 + random() * 92,
        delay: random() * 0.7,
        opacity: 0.6 + random() * 0.35,
    }));
}

export default function PageDots() {
    const dots = makeDots(hashString(usePathname()));

    return (
        <div className="page-bleed-area" aria-hidden="true">
            {dots.map((dot, i) => (
                <span
                    key={i}
                    className="page-dot"
                    style={{
                        left: `${dot.left}%`,
                        top: `${dot.top}px`,
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                        opacity: dot.opacity,
                        animationDelay: `${dot.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
