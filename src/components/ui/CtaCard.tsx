import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 大きなカード型のリンク（CTA）。トップの導線カードの大きさ・角丸・影・余白を基準に、サイト全体で揃える。
// layout="card": トップと同じ大きさ（高さh-64、幅は最大約440px）。
// layout="fill": 隣の要素と高さ・幅を合わせて並べる場所用（大きさは親に任せ、角丸・影・余白などは同じ）。
type Props = {
    href: string;
    label: string;
    title: string;
    caption: string;
    heading?: "h2" | "h3";
    layout?: "card" | "fill";
    // ホバー時の色。既定は青（primary）。サービスごとに変える（DaiDai: 橙 / dolce: 朱）
    tone?: "primary" | "orange" | "vermilion";
    className?: string;
};

// Tailwindは動的なクラス名を拾えないため、色ごとに全文を書く
const toneClass = {
    primary: {
        label: "group-hover:text-primary",
        arrow: "group-hover:border-primary group-hover:bg-primary",
    },
    orange: {
        label: "group-hover:text-tertiary",
        arrow: "group-hover:border-tertiary group-hover:bg-tertiary",
    },
    vermilion: {
        label: "group-hover:text-vermilion",
        arrow: "group-hover:border-vermilion group-hover:bg-vermilion",
    },
} as const;

const sizeClass = {
    card: "h-64 w-full max-w-[27.5rem]",
    fill: "",
} as const;

export default function CtaCard({ href, label, title, caption, heading = "h3", layout = "card", tone = "primary", className = "" }: Props) {
    const cls = `group block ${sizeClass[layout]} bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 hover:bg-white/80 hover:border-white hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard rounded-m3-lg overflow-hidden relative p-8 ${className}`.trim();
    const Heading = heading;

    const inner = (
        <div className="relative z-10 h-full flex flex-col justify-between gap-8">
            <div>
                <Heading className={`text-sm font-bold tracking-widest text-gray-400 ${toneClass[tone].label} transition-colors`}>
                    {label}
                </Heading>
                <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">{title}</p>
            </div>
            <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{caption}</span>
                <div className={`w-10 h-10 shrink-0 rounded-full border border-gray-300 bg-white/40 ${toneClass[tone].arrow} group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2`}>
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
