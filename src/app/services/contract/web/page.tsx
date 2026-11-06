import { Metadata } from "next";
import EstimateSimulator from "@/components/contract/EstimateSimulator";
import { ContractFlow, ContractFooter, ContractHero, ContractNotes, ContractSection, cardClass } from "../ContractCommon";

export const metadata: Metadata = {
    title: "HP制作（受託） | サービス紹介 | Rhing",
    description: "維持費はドメイン代だけ。WordPressを使わず、一から手書きで作るホームページ制作。機能を選ぶと、見積もりの目安が出ます。",
};

const flow = [
    { title: "ヒアリング", body: "ホームページの目的やイメージ、ご用意いただける素材をお伺いします。" },
    { title: "お見積もり・仮払い", body: "内容に合わせてプランをご提案します。" },
    { title: "初期設定", body: "GitHub・Googleアカウントの作成とドメインの取得をお願いします。手順書をお渡しし、難しい場合はGoogle Meetでサポートします。" },
    { title: "制作・進捗報告", body: "節目ごとに進捗をご報告します。制作中のページは、URLから実際にご確認いただけます。" },
    { title: "完成・最終確認", body: "複数の端末で、表示とフォームの送信を確認していただきます。" },
    { title: "移管・納品", body: "GitHubリポジトリをお客様へ移管し、Vercelと連携して公開します。" },
];

const sections = [
    { title: "おすすめの方", items: ["名刺代わりのサイトが欲しい方", "作ったあと、頻繁には更新しない方"] },
    { title: "おすすめできない方", items: ["ブログなどを、ご自身で定期的に更新したい方", "コードの知識なしに、サイトを編集したい方", "簡単な設定まで、お任せしたい方"] },
    { title: "ご用意いただくもの", items: ["掲載するテキスト・画像・ロゴ（フリー素材を使う場合は、ライセンスをご確認ください）"] },
    { title: "対応していないこと", items: ["ECカート・決済機能", "オプションの会員機能（ログイン・会員限定ページ）を超える、ログイン・データベースを使った動的な処理", "WordPress・CMSの導入", "公開後の継続的な保守"] },
    { title: "修正について", items: ["各プランに、無料の修正3回が含まれます。", "それ以上の修正は、1回5,000円で承ります。"] },
];

export default function ContractWebPage() {
    return (
        <div className="w-full text-gray-800 pb-32">
            <ContractHero
                category="Contract / Web"
                title="HP制作"
                tagline="維持費はドメイン代だけ。"
                body="WordPressを使わず、HTML・CSS・TypeScriptで一から手書きするホームページ制作です。無料のホスティングを使うため、サーバー代は0円。表示が速く、セキュリティ上のリスクも最小限です。"
            />

            <div className="container mx-auto px-6 max-w-5xl flex flex-col gap-12">
                <section className={`${cardClass} p-8 md:p-12`}>
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

                <ContractSection title="見積もり">
                    <p className="text-gray-700 leading-relaxed mb-6">ページ数と機能を選ぶと、見積もりの目安が出ます。</p>
                    <EstimateSimulator kind="web" />
                </ContractSection>

                <ContractFlow steps={flow} />
                <ContractNotes sections={sections} />

                <section className={`${cardClass} p-8 md:p-12`}>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-4">制作実績</h2>
                    <p className="text-gray-700 leading-relaxed">
                        このサイト（rhing.jp）は、HTML・CSS・TypeScriptで制作・運用しています。ポートフォリオとして、ご覧ください。
                    </p>
                </section>

                <ContractFooter disclaimer="納品後の運用・更新・ドメインの管理は、お客様の責任となります。ドメインの更新忘れによるサイトの停止などについて、当方は責任を負いかねます。損害賠償の範囲は、受領した報酬額を上限とします。" />
            </div>
        </div>
    );
}
