import { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import ContactForm from "./ContactForm";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
    title: "お問い合わせ | Rhing",
    description: "Rhingへのユーザー向け・企業向けのお問い合わせ窓口です。",
};

export default function ContactPage() {
    return (
        <div className="w-full pb-32">
            <div className="container mx-auto px-6 pt-32 pb-16 max-w-4xl">
                {/* 
                  🌟 修正ポイント: タイトルエリアをガラス風カードのデザインに変更 
                  - bg-white/40 (半透明), backdrop-blur-md (ぼかし), border-white/80 (細い白境界線), shadow-md を追加
                  - 丸みのあるデザイン（rounded-3xl）と上下のパディング（py-10）で美しく配置しています
                */}
                <div className="mb-16 text-center py-10 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">CONTACT</h1>
                    <p className="text-gray-500 tracking-wider text-sm">お問い合わせ</p>
                </div>
            </div>

            {/* フォーム本体を読み込みます */}
            <Suspense fallback={<div className="text-center text-gray-500 tracking-widest">読み込み中...</div>}>
                <ContactForm />
            </Suspense>

            {/* Discordサーバーへの導線 */}
            <div className="container mx-auto px-6 max-w-3xl mt-12">
                <a
                    href={siteConfig.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-64 bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                                DISCORD
                            </h2>
                            <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                サーバーに加入して、質問や意見交換をしよう
                            </p>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                Rhing公式Discordサーバー
                            </span>
                            <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}