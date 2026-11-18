import type { LucideIcon } from "lucide-react";

// サービスページ共通の節の見出し。小さい英字ラベル＋アイコン付きの見出し。アイコンは必須。
// tone: アイコンの色（DaiDai: 橙 / dolce: 朱）。
const toneClass = {
    orange: "text-tertiary",
    vermilion: "text-vermilion",
} as const;

type Props = {
    label: string;
    title: string;
    icon: LucideIcon;
    tone?: keyof typeof toneClass;
    mb?: string;
    center?: boolean;
};

export default function SectionHeading({ label, title, icon: Icon, tone = "orange", mb = "mb-8", center = false }: Props) {
    return (
        <>
            <span className={`text-xs font-bold tracking-widest text-gray-500 mb-2 block ${center ? "text-center" : ""}`}>{label}</span>
            <h2 className={`text-2xl font-bold ${mb} tracking-wide text-gray-900 text-balance flex items-center gap-3 ${center ? "justify-center" : ""}`}>
                <Icon className={`w-5 h-5 ${toneClass[tone]} shrink-0`} strokeWidth={1.5} />
                {title}
            </h2>
        </>
    );
}
