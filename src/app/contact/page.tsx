import { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "./ContactForm";
import { siteConfig } from "@/data/siteConfig";
import CtaCard from "@/components/ui/CtaCard";
import Illustration from "@/components/Illustration";

export const metadata: Metadata = {
    title: "お問い合わせ | Rhing",
    description: "Rhingへの利用者向け・企業向けのお問い合わせ窓口です。",
};

export default function ContactPage() {
    return (
        <div className="w-full pb-32">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                {/*
                  🌟 修正ポイント: タイトルエリアをガラス風カードのデザインに変更
                  - bg-surface-container-lowest/40 (半透明), backdrop-blur-md (ぼかし), border-glass-edge/80 (細い白境界線), shadow-md を追加
                  - 丸みの有るデザイン（rounded-3xl）と上下のパディング（py-10）で美しく配置しています
                */}
                <div className="mb-16 relative flex flex-col items-center justify-center text-center py-10 px-8 md:px-14 md:min-h-44 lg:min-h-52 bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-md shadow-outline-variant/20 rounded-3xl">
                    <Illustration name="new-message" className="hidden md:block absolute left-8 md:left-14 top-1/2 -translate-y-1/2 w-40 lg:w-48 h-auto" />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">CONTACT</h1>
                    <p className="text-on-surface-subtle tracking-wider text-sm">お問い合わせ</p>
                </div>
            </div>

            {/* フォーム本体を読み込みます */}
            <Suspense fallback={<div className="text-center text-on-surface-subtle tracking-widest">読み込み中...</div>}>
                <ContactForm />
            </Suspense>

            {/* Discordサーバーへの導線 */}
            <div className="container mx-auto px-6 max-w-3xl mt-12">
                <CtaCard
                    href={siteConfig.socialLinks.discord}
                    label="DISCORD"
                    title="サーバーに加入して、質問や意見交換をしよう"
                    caption="Rhing公式Discordサーバー"
                    heading="h2"
                    className="mx-auto"
                />
            </div>
        </div>
    );
}
