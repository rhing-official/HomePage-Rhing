import { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "./ContactForm";

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
        </div>
    );
}