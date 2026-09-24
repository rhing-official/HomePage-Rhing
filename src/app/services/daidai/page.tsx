import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { AudienceProvider, AudienceToggle } from "./AudienceContext";
import AudienceContent from "./AudienceContent";

export const metadata: Metadata = {
    title: "DaiDai | Rhing",
    description: "整う、守る、私に馴染む。個人情報を収集しない、プライバシーファーストな国産メッセージアプリ",
};

type Platform = { name: string; status: "available" | "planned"; url?: string };

const platforms: Platform[] = [
    { name: "Web", status: "available", url: "https://dai-dai-phi.vercel.app" },
    { name: "Android", status: "planned" },
    { name: "Windows", status: "planned" },
    { name: "Linux", status: "planned" },
    { name: "iOS", status: "planned" },
    { name: "macOS", status: "planned" },
];

export default function DaiDaiPage() {
    return (
        <div className="w-full bg-[#fdfbf7] text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DaiDai</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-[#EE7800]">「整う、守る、私に馴染む。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto">
                    個人情報を収集しない、プライバシーファーストなメッセージアプリ
                </p>
            </div>

            {/* CTAカード */}
            <div className="container mx-auto px-6 pb-16">
                <a
                    href="https://dai-dai-phi.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-64 w-full max-w-sm mx-auto bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-orange-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-[#EE7800] transition-colors">
                                WEB
                            </h3>
                            <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                今すぐブラウザで試す
                            </p>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                無料でご利用いただけます
                            </span>
                            <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-[#EE7800] group-hover:bg-[#EE7800] group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </a>
            </div>

            {/* 対応プラットフォーム */}
            <section className="container mx-auto px-6 py-16 max-w-4xl">
                <h2 className="text-2xl font-bold mb-12 tracking-widest text-center text-gray-900">対応プラットフォーム</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {platforms.map((p) => {
                        const available = p.status === "available";
                        const cardClass = available
                            ? "bg-[#EE7800] text-white rounded-2xl p-6 text-center font-bold tracking-wide"
                            : "border border-gray-300 text-gray-400 rounded-2xl p-6 text-center";
                        const content = available ? (
                            p.name
                        ) : (
                            <>
                                <p className="font-bold tracking-wide mb-1">{p.name}</p>
                                <p className="text-xs tracking-widest">対応予定</p>
                            </>
                        );

                        return p.url ? (
                            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={`${cardClass} block transition-opacity hover:opacity-90`}>
                                {content}
                            </a>
                        ) : (
                            <div key={p.name} className={cardClass}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </section>

            <AudienceProvider>
                {/* 一般向け/ギーク向け切り替え */}
                <div className="container mx-auto px-6 py-12 flex justify-center">
                    <AudienceToggle />
                </div>

                {/* 機能紹介（一般向け/ギーク向けでトグル） */}
                <section className="container mx-auto px-6 py-8">
                    <AudienceContent />
                </section>
            </AudienceProvider>
        </div>
    );
}
