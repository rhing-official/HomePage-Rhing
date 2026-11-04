import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "受託開発 | サービス紹介 | Rhing",
    description: "維持費はドメイン代だけ。WordPressを使わず、一から手書きで作るホームページ制作を承ります。",
};

const plans = [
    { name: "お試し1ページ", price: "27,500円", days: "14日", body: "LP仕様の1ページサイトです。パンフレット代わりの紹介サイトにも向いています。" },
    { name: "標準4ページ", price: "44,000円", days: "30日", body: "トップ・事業紹介・会社概要・求人などの4ページ構成です。内容はカスタマイズできます。" },
    { name: "高機能4ページ", price: "66,000円", days: "30日", body: "標準プランに条件分岐フォームを追加。ご用件に応じて、フォームとメール本文が自動で切り替わります。" },
];

const flow = [
    { title: "ヒアリング", body: "ホームページの目的やイメージ、ご用意いただける素材をお伺いします。" },
    { title: "お見積もり・仮払い", body: "内容に合わせてプランをご提案します。" },
    { title: "初期設定", body: "GitHub・Googleアカウントの作成とドメインの取得をお願いします。手順書をお渡しし、難しい場合はGoogle Meetでサポートします。" },
    { title: "制作・進捗報告", body: "節目ごとに進捗をご報告します。制作中のページは、URLから実際にご確認いただけます。" },
    { title: "完成・最終確認", body: "複数の端末で、表示とフォームの送信を確認していただきます。" },
    { title: "移管・納品", body: "GitHubリポジトリをお客様へ移管し、Vercelと連携して公開します。" },
];

const sections: { title: string; items: string[] }[] = [
    { title: "おすすめの方", items: ["名刺代わりのサイトが欲しい方", "作ったあと、頻繁には更新しない方"] },
    { title: "おすすめできない方", items: ["ブログなどを、ご自身で定期的に更新したい方", "コードの知識なしに、サイトを編集したい方", "簡単な設定まで、お任せしたい方"] },
    { title: "ご用意いただくもの", items: ["掲載するテキスト・画像・ロゴ（フリー素材を使う場合は、ライセンスをご確認ください）"] },
    { title: "対応していないこと", items: ["ECカート・決済機能", "ログイン・会員機能、データベースを使った動的な処理", "WordPress・CMSの導入", "公開後の継続的な保守"] },
    { title: "修正について", items: ["各プランに、無料の修正3回が含まれます。", "それ以上の修正は、1回5,000円で承ります。"] },
];

export default function ContractPage() {
    return (
        <div className="w-full bg-surface text-gray-800 pb-32">
            <div className="container mx-auto px-6 pb-20 text-center">
                <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">Contract</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">受託開発</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8 text-tertiary">「維持費はドメイン代だけ。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto">
                    WordPressを使わず、HTML・CSS・TypeScriptで一から手書きするホームページ制作です。無料のホスティングを使うため、サーバー代は0円。表示が速く、セキュリティ上のリスクも最小限です。
                </p>
            </div>

            <div className="container mx-auto px-6 max-w-4xl flex flex-col gap-12">
                {/* 維持費の比較 */}
                <section className="bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-6">3年間の維持費</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-m3-lg bg-primary-container/60 p-6">
                            <p className="text-sm text-gray-600 mb-1">本サービス</p>
                            <p className="text-3xl font-bold text-gray-900">約6,000円</p>
                            <p className="text-xs text-gray-500 mt-2">ドメイン代 年2,000円 × 3年</p>
                        </div>
                        <div className="rounded-m3-lg bg-white/60 p-6">
                            <p className="text-sm text-gray-600 mb-1">WordPress</p>
                            <p className="text-3xl font-bold text-gray-900">約114,000円</p>
                            <p className="text-xs text-gray-500 mt-2">（ドメイン代 年2,000円 ＋ サーバー代 月3,000円）× 3年</p>
                        </div>
                    </div>
                </section>

                {/* プラン */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-6">プランと価格</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.name} className="bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl p-8 flex flex-col">
                                <h3 className="font-bold text-gray-900 tracking-wider">{plan.name}</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-3">{plan.price}</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">納期の目安 {plan.days}</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{plan.body}</p>
                            </div>
                        ))}
                    </div>
                    <ul className="mt-6 text-sm text-gray-600 space-y-1 list-disc pl-5">
                        <li>ページの追加: 1ページ10,000円（納期 +5日）</li>
                        <li>全プランに、SEOの基本対策（タイトル・メタディスクリプション・見出し構造・画像のalt属性）が含まれます。</li>
                    </ul>
                </section>

                {/* アプリ開発 */}
                <section className="bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-4">アプリ開発もご相談ください</h2>
                    <p className="text-gray-700 leading-relaxed">
                        予約・記録・会員証など、用途がはっきりした小さなアプリを、Flutterで制作します。機能と画面を先に決めて、範囲を決めた定額でお見積もりします（目安は10万円〜）。メッセージアプリ「DaiDai」を、個人で設計・開発・運用しています。
                    </p>
                </section>

                {/* 納品の流れ */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-6">納品の流れ</h2>
                    <ol className="space-y-4">
                        {flow.map((step, i) => (
                            <li key={step.title} className="flex gap-4 bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-lg p-6">
                                <span className="shrink-0 w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center">{i + 1}</span>
                                <div>
                                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed mt-1">{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* 注意事項 */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section) => (
                        <div key={section.title} className="bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl p-8">
                            <h3 className="font-bold text-gray-900 tracking-wider mb-3">{section.title}</h3>
                            <ul className="text-sm text-gray-700 leading-relaxed space-y-1 list-disc pl-5">
                                {section.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                {/* 実績 */}
                <section className="bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-4">制作実績</h2>
                    <p className="text-gray-700 leading-relaxed">
                        このサイト（rhing.jp）は、HTML・CSS・TypeScriptで制作・運用しています。ポートフォリオとして、ご覧ください。
                    </p>
                </section>

                <p className="text-xs text-gray-500 leading-relaxed">
                    納品後の運用・更新・ドメインの管理は、お客様の責任となります。ドメインの更新忘れによるサイトの停止などについて、当方は責任を負いかねます。損害賠償の範囲は、受領した報酬額を上限とします。
                </p>

                <div className="text-center">
                    <Link
                        href="/contact?type=business"
                        className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold tracking-wider hover:bg-primary/90 hover:shadow-elevation-2 transition-all"
                    >
                        ご相談・お見積もりはこちら
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
