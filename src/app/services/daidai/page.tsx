import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { AudienceProvider } from "./AudienceContext";
import AudienceContent, { AudienceHeader } from "./AudienceContent";
import EnvironmentList from "@/components/EnvironmentList";

export const metadata: Metadata = {
    title: "DaiDai | Rhing",
    description: "整う、守る、私に馴染む。個人情報を収集しない、プライバシーファーストなメッセージアプリ",
};

type Platform = { name: string; status: "available" | "planned"; url?: string };

const platforms: Platform[] = [
    { name: "Web", status: "available", url: "https://daidai.rhing.jp" },
    { name: "Android", status: "planned" },
    { name: "iOS", status: "planned" },
    { name: "Windows", status: "planned" },
    { name: "Linux", status: "planned" },
    { name: "macOS", status: "planned" },
];

export default function DaiDaiPage() {
    return (
        <div className="w-full bg-surface text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DaiDai</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-tertiary">「整う、守る、私に馴染む。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto">
                    個人情報を収集しない、プライバシーファーストなメッセージアプリ
                </p>
            </div>

            {/* CTAカード + 対応プラットフォーム */}
            <div className="container mx-auto px-6 pb-24 max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                    <a
                        href="https://daidai.rhing.jp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block lg:w-2/5 bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-orange-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                    >
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-tertiary transition-colors">
                                    WEB
                                </h3>
                                <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                    今すぐブラウザで試す
                                </p>
                            </div>
                            <div className="flex items-end justify-between mt-8">
                                <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                    無料でご利用いただけます
                                </span>
                                <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-tertiary group-hover:bg-tertiary group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </a>

                    <div className="lg:w-3/5 bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 rounded-lg p-8">
                        <h2 className="text-lg font-bold mb-6 tracking-widest text-gray-900">対応プラットフォーム</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {platforms.map((p) => {
                                const available = p.status === "available";
                                const cardClass = available
                                    ? "bg-white text-gray-800 border border-gray-200 hover:bg-tertiary/10 hover:border-tertiary/30 rounded-xl p-5 text-center font-bold tracking-wide transition-colors duration-300"
                                    : "border border-gray-200 text-gray-400 rounded-xl p-5 text-center";
                                const content = available ? (
                                    p.name
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
                            ]}
                            note="Web版をブラウザで確認した結果です（括弧内は使用したブラウザ）。"
                            checkedAt="2026/10/12"
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
