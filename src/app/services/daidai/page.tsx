import { Metadata } from "next";
import CtaCard from "@/components/ui/CtaCard";
import { AudienceProvider } from "./AudienceContext";
import AudienceContent, { AudienceHeader } from "./AudienceContent";
import ScreenshotViewerProvider from "./ScreenshotViewer";
import { screenshotList } from "./screenshots";
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
    { name: "iOS", status: "available", url: "https://testflight.apple.com/join/3VDJRTKw", note: "TestFlightのみ" },
    { name: "Windows", status: "planned" },
    { name: "macOS", status: "planned" },
    { name: "Linux", status: "planned" },
];

export default function DaiDaiPage() {
    return (
        <div className="w-full text-on-surface pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">DaiDai</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-tertiary">「整う、守る、私に馴染む。」</p>
                <p className="text-on-surface-variant leading-relaxed mx-auto">
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

                    <div className="lg:w-3/5 bg-surface-container-lowest/50 backdrop-blur-md border border-glass-edge/80 shadow-elevation-2 rounded-lg p-8">
                        <h2 className="text-lg font-bold mb-6 tracking-widest text-on-surface">対応プラットフォーム</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {platforms.map((p) => {
                                const available = p.status === "available";
                                const cardClass = available
                                    ? "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-tertiary/10 hover:border-tertiary/30 rounded-xl p-5 text-center font-bold tracking-wide transition-colors duration-300"
                                    : "border border-outline-variant text-outline rounded-xl p-5 text-center";
                                const content = available ? (
                                    p.note ? (
                                        <>
                                            <p>{p.name}</p>
                                            <p className="text-xs font-medium tracking-widest text-on-surface-subtle mt-1">{p.note}</p>
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
                            className="mt-8 pt-6 border-t border-outline-variant"
                            items={[
                                { os: "iPad 第9世代", detail: "iPadOS 27 β・Floorp・TestFlight" },
                                { os: "motorola edge 50s pro", detail: "Android 16・Firefox・APK" },
                                { os: "Zorin 18", detail: "Floorp・Vivaldi" },
                                { os: "Windows 11", detail: "Floorp・Vivaldi" },
                            ]}
                            note="iPadとAndroidは、ブラウザでのWeb版と、アプリの両方で確認した結果です。ZorinとWindowsは、Web版だけの結果です。括弧内は、OSと、使用したブラウザと、アプリの配布形式です。"
                            checkedAt="2026/11/27"
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
                    <ScreenshotViewerProvider images={screenshotList}>
                        <AudienceContent />
                    </ScreenshotViewerProvider>
                </section>
            </AudienceProvider>
        </div>
    );
}
