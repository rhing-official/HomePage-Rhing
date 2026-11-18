import { Metadata } from "next";
import CtaCard from "@/components/ui/CtaCard";
import { AudienceProvider } from "./AudienceContext";
import AudienceContent, { AudienceHeader } from "./AudienceContent";
import EnvironmentList from "@/components/EnvironmentList";

const title = "DaiDai | Rhing";
const description = "整う、守る、私に馴染む。広告なし、電話番号・メールアドレスの入力が不要なメッセージアプリ。取得する情報と取得しない情報、現在の制限事項と今後の予定を、公開しています。";

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: "https://rhing.jp/services/daidai" },
    openGraph: {
        title,
        description,
        url: "https://rhing.jp/services/daidai",
        siteName: "Rhing",
        locale: "ja_JP",
        type: "website",
    },
    twitter: { card: "summary", title, description },
};

type Platform = { name: string; status: "available" | "planned"; url?: string; note?: string };

const platforms: Platform[] = [
    { name: "Web", status: "available", url: "https://daidai.rhing.jp" },
    { name: "Android", status: "available", url: "https://github.com/rhing-official/DaiDai/releases/latest", note: "APKのみ" },
    { name: "iOS", status: "planned" },
    { name: "Windows", status: "planned" },
    { name: "macOS", status: "planned" },
    { name: "Linux", status: "planned" },
];

export default function DaiDaiPage() {
    return (
        <div className="w-full text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DaiDai</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-tertiary">「整う、守る、私に馴染む。」</p>
                <p className="text-gray-600 leading-relaxed mx-auto">
                    広告なし、電話番号・メールアドレスの入力が不要な、プライバシーを大切にするメッセージアプリ
                </p>
            </div>

            {/* CTAカード + 対応プラットフォーム */}
            <div className="container mx-auto px-6 pb-24 max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                    <CtaCard
                        tone="orange"
                        href="https://daidai.rhing.jp"
                        label="WEB"
                        title="今すぐブラウザで試す"
                        caption="無料でご利用いただけます"
                        layout="fill"
                        className="lg:w-2/5"
                    />

                    <div className="lg:w-3/5 bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 rounded-lg p-8">
                        <h2 className="text-lg font-bold mb-6 tracking-widest text-gray-900">対応プラットフォーム</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {platforms.map((p) => {
                                const available = p.status === "available";
                                const cardClass = available
                                    ? "bg-white text-gray-800 border border-gray-200 hover:bg-tertiary/10 hover:border-tertiary/30 rounded-xl p-5 text-center font-bold tracking-wide transition-colors duration-300"
                                    : "border border-gray-200 text-gray-400 rounded-xl p-5 text-center";
                                const content = available ? (
                                    p.note ? (
                                        <>
                                            <p>{p.name}</p>
                                            <p className="text-xs font-medium tracking-widest text-gray-500 mt-1">{p.note}</p>
                                        </>
                                    ) : (
                                        p.name
                                    )
                                ) : (
                                    <>
                                        <p className="font-bold tracking-wide mb-1">{p.name}</p>
                                        <p className="text-xs tracking-widest">対応予定</p>
                                    </>
                                );

                                return p.url ? (
                                    <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={`${cardClass} block`}>
                                        {content}
                                    </a>
                                ) : (
                                    <div key={p.name} className={cardClass}>
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                        <EnvironmentList
                            className="mt-8 pt-6 border-t border-gray-200"
                            items={[
                                { os: "iPadOS 27 β", detail: "Floorp" },
                                { os: "Android 16", detail: "Firefox" },
                                { os: "Zorin OS 18", detail: "Floorp・Vivaldi" },
                                { os: "motorola edge 50s pro", detail: "Android 16・APK" },
                            ]}
                            note="Web版はブラウザ、motorola edge 50s proはAPKで確認した結果です（括弧内は使用したブラウザ、またはOSと配布形式）。"
                            checkedAt="2026/11/18"
                        />
                    </div>
                </div>
            </div>

            <AudienceProvider>
                {/* 一般向け/ギーク向け切り替え + CONTENTS目次 */}
                <div className="container mx-auto px-6 py-12 max-w-5xl">
                    <AudienceHeader />
                </div>

                {/* 機能紹介（一般向け/ギーク向けでトグル） */}
                <section className="container mx-auto px-6 py-8">
                    <AudienceContent />
                </section>
            </AudienceProvider>
        </div>
    );
}
