import { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import Illustration from "@/components/Illustration";

export const metadata: Metadata = {
    title: "クリエイター向けポリシー | Rhing",
    description: "Rhing・DaiDai・dolce・daidai横丁のロゴとサービス名の、利用方針です。",
};

// ロゴ素材を追加する場合は、public/downloads/logos/ にzipを置いて、ここに追記する
// page: サービス名をクリックしたときに開く、サービスの紹介ページ（無いものは文字のみ）
const logoKits: { name: string; href: string; page?: string }[] = [
    { name: "Rhing", href: "/downloads/logos/rhing.zip" },
    { name: "DaiDai", href: "/downloads/logos/daidai.zip", page: "/services/daidai" },
    { name: "dolce", href: "/downloads/logos/dolce.zip", page: "/services/dolce" },
];

export default function CreatorPolicyPage() {
    return (
        <div className="container mx-auto px-6 pb-32 max-w-4xl">
            {/* ページタイトル */}
            {/* 🌟 修正ポイント1: タイトルエリアをガラスカードのデザインに変更 */}
            <div className="mb-24 relative flex flex-col items-center justify-center text-center py-10 px-8 md:px-14 md:min-h-44 lg:min-h-52 bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-elevation-1 rounded-m3-xl">
                <Illustration name="terms" className="hidden lg:block absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-auto" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">CREATOR POLICY</h1>
                <p className="text-on-surface-subtle tracking-wider text-sm">クリエイター向けポリシー</p>
            </div>

            <article className="space-y-12">

                {/* ロゴとサービス名の利用 */}
                {/*
                  🌟 修正ポイント2: セクションカードをガラスデザインに変更
                  - bg-surface-container-lowest/40 (半透明), backdrop-blur-md, border-glass-edge/80
                */}
                <section className="bg-surface-container-lowest/40 backdrop-blur-md p-8 md:p-12 border border-glass-edge/80 border-l-4 border-l-gray-900 shadow-elevation-1 rounded-r-m3-lg hover:bg-surface-container-lowest/60 hover:shadow-elevation-3 transition-all duration-500">
                    <h2 className="text-2xl font-black text-on-surface mb-8 tracking-wide border-b border-on-surface/10 pb-4">ロゴとサービス名の利用について</h2>
                    <p className="text-on-surface-variant leading-loose text-lg font-medium mb-10">
                        Rhingに関するロゴとサービス名は、事前の許可や連絡なしに、自由に使えます。用意した素材をそのまま使うことも、自分で描き直すことも、変形や加工をすることもできます。作品の中でも外でも、商用でも非商用でも構いません。クレジットの表記も要りません。
                    </p>
                    {/* 使用例 */}
                    {/* 🌟 修正ポイント3: 使用例ボックスをグリーンカラーの半透明ガラス仕様に変更 */}
                    <div className="bg-green-500/10 backdrop-blur-sm p-6 rounded-xl border border-green-500/20">
                        <h4 className="font-bold text-green-950 dark:text-green-200 mb-4 flex items-center">
                            <span className="mr-2">○</span> 使用例
                        </h4>
                        <ul className="list-disc pl-5 space-y-2 text-green-800 dark:text-green-200 text-sm">
                            <li>書籍・映像・ゲーム・アプリ・グッズ等での使用</li>
                            <li>キャラクターが使うアプリとしての描写</li>
                            <li>ロゴの描き直し・変形・加工・パロディ</li>
                            <li>悪役が使う、犯罪シーンで使う、等の描写</li>
                        </ul>
                    </div>
                </section>

                {/* 方針 */}
                <section className="bg-surface-container-lowest/40 backdrop-blur-md p-8 md:p-12 border border-glass-edge/80 border-l-4 border-l-gray-900 shadow-elevation-1 rounded-r-m3-lg hover:bg-surface-container-lowest/60 hover:shadow-elevation-3 transition-all duration-500">
                    <h2 className="text-2xl font-black text-on-surface mb-6 tracking-wide border-b border-on-surface/10 pb-4">方針</h2>
                    <ul className="list-disc pl-6 space-y-4 text-on-surface-variant leading-relaxed text-lg font-medium">
                        <li>ロゴやキャラクター等の権利は、Rhingと代表に帰属します。権利を放棄するものではなく、自由な利用を許諾するものです。</li>
                        <li>法令に反する使い方、例えばなりすましや詐欺に使うことは、この許諾の範囲に含まれません。</li>
                        <li>営業妨害に該当する描写については、抗議する権利を留保します。</li>
                    </ul>
                </section>

                {/* ダウンロード */}
                <section className="bg-surface-container-lowest/40 backdrop-blur-md p-8 md:p-12 border border-glass-edge/80 border-l-4 border-l-gray-900 shadow-elevation-1 rounded-r-m3-lg hover:bg-surface-container-lowest/60 hover:shadow-elevation-3 transition-all duration-500">
                    <h2 className="text-2xl font-black text-on-surface mb-8 tracking-wide border-b border-on-surface/10 pb-4">ダウンロード</h2>
                    <p className="text-on-surface-variant leading-loose text-lg font-medium mb-8">
                        ロゴ素材をブランド毎にダウンロード出来ます。
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {logoKits.map((kit) => (
                            <div key={kit.name} className="aspect-square flex flex-col bg-surface-container-lowest/90 border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex-1 flex items-center justify-center bg-blue-50/60 dark:bg-blue-950/40">
                                    {kit.page ? (
                                        <Link href={kit.page} className="font-bold text-on-surface text-lg underline decoration-outline/50 underline-offset-4 hover:text-primary hover:decoration-primary transition-colors">
                                            {kit.name}
                                        </Link>
                                    ) : (
                                        <span className="font-bold text-on-surface text-lg">{kit.name}</span>
                                    )}
                                </div>
                                <div className="flex-1 flex items-center justify-center p-4 border-t border-outline-variant">
                                    <a
                                        href={kit.href}
                                        download
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant font-bold text-sm shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300"
                                    >
                                        <Download className="w-4 h-4" />
                                        ダウンロード
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </article>
        </div>
    );
}
