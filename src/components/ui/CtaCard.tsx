import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 大きなカード型のリンク（CTA）。トップの導線カードの大きさ・角丸・影・余白を基準に、サイト全体で揃える。
// layout="card": トップと同じ大きさ（高さh-64、幅は最大約440px）。
// layout="fill": 隣の要素と高さ・幅を合わせて並べる場所用（大きさは親に任せ、角丸・影・余白などは同じ）。
// compact: 幅768px未満（1列になる縦画面）だけ、横長の1行にする。文字の大きさと矢印の押す面は保ち、説明文だけ省いて、高さを約84pxにする。
//          4枚を1列に並べても、画面の半分ほどに収まる。幅768px以上は、通常のカードのまま。
type Props = {
    href: string;
    label: string;
    title: string;
    caption: string;
    heading?: "h2" | "h3";
    layout?: "card" | "fill";
    compact?: boolean;
    // ホバー時の色。既定は青（primary）。サービスごとに変える（DaiDai: 橙 / dolce: 朱）
    tone?: "primary" | "orange" | "vermilion";
    className?: string;
};

// Tailwindは動的なクラス名を拾えないため、色ごとに全文を書く
const toneClass = {
    primary: {
        label: "group-hover:text-primary",
        arrow: "group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary",
    },
    orange: {
        label: "group-hover:text-tertiary",
        arrow: "group-hover:border-tertiary group-hover:bg-tertiary group-hover:text-white dark:group-hover:text-surface",
    },
    vermilion: {
        label: "group-hover:text-vermilion",
        arrow: "group-hover:border-vermilion group-hover:bg-vermilion group-hover:text-white dark:group-hover:text-surface",
    },
} as const;

const sizeClass = {
    card: "h-64 w-full max-w-[27.5rem]",
    fill: "",
} as const;

export default function CtaCard({ href, label, title, caption, heading = "h3", layout = "card", compact = false, tone = "primary", className = "" }: Props) {
    const size = compact && layout === "card" ? "md:h-64 w-full max-w-[27.5rem]" : sizeClass[layout];
    const pad = compact ? "p-5 md:p-8" : "p-8";
    const cls = `group block ${size} bg-surface-container-lowest/50 backdrop-blur-md border border-glass-edge/80 shadow-elevation-2 hover:bg-surface-container-lowest/80 hover:border-glass-edge hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard rounded-m3-lg overflow-hidden relative ${pad} ${className}`.trim();
    const Heading = heading;

    const inner = (
        <div className={`relative z-10 h-full flex flex-col justify-between gap-8 ${compact ? "max-md:flex-row max-md:items-center max-md:gap-4" : ""}`}>
            <div>
                <Heading className={`text-sm font-bold tracking-widest text-outline ${toneClass[tone].label} transition-colors`}>
                    {label}
                </Heading>
                <p className="text-2xl font-bold mt-2 text-on-surface group-hover:text-on-surface transition-colors">{title}</p>
            </div>
            <div className="flex items-end justify-between gap-3">
                <span className={`text-sm text-on-surface-subtle group-hover:text-outline transition-colors ${compact ? "max-md:hidden" : ""}`}>{caption}</span>
                <div className={`w-10 h-10 shrink-0 rounded-full border border-outline/50 bg-surface-container-lowest/40 ${toneClass[tone].arrow} flex items-center justify-center text-on-surface transition-all duration-300 transform group-hover:translate-x-2`}>
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>
        </div>
    );

    if (/^https?:\/\//.test(href)) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
            </a>
        );
    }
    return (
        <Link href={href} className={cls}>
            {inner}
        </Link>
    );
}
