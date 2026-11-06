import { Metadata } from "next";
import EstimateSimulator from "@/components/contract/EstimateSimulator";
import { ContractFlow, ContractFooter, ContractHero, ContractNotes, ContractSection, cardClass } from "../ContractCommon";

export const metadata: Metadata = {
    title: "アプリ制作（受託） | サービス紹介 | Rhing",
    description: "用途がはっきりした小さなアプリを、Flutterで制作。範囲を先に決めた定額で承ります。機能を選ぶと、見積もりの目安が出ます。",
};

const flow = [
    { title: "ヒアリング", body: "アプリの用途と、必要な機能・画面を伺います。" },
    { title: "機能・画面一覧の確定", body: "この一覧の範囲で、ご契約いただきます。" },
    { title: "お見積もり・仮払い", body: "一覧の範囲内の金額でお出しします。一覧に無い機能の追加は、作業の前に別見積もりです。" },
    { title: "制作・動作確認", body: "節目ごとに動作を確認していただきます。" },
    { title: "検収", body: "お客様の確認をもって、検収とします。" },
    { title: "移管・納品", body: "ソースコードをお客様のGitHubへ移管します。Firebase・Google Play・ドメインなどのアカウントは、お客様名義で作成していただき、手順書とGoogle Meetでサポートします。" },
];

const sections = [
    { title: "おすすめの方", items: ["予約・在庫・会員証・社内用の記録など、用途がはっきりした小さなアプリが欲しい方", "画面と機能を最初に決め、その範囲で作ってほしい方"] },
    { title: "おすすめできない方", items: ["機能を作りながら決めていきたい方（仕様が変わる場合は別見積もりです）", "大規模なSNS・ゲーム・動画配信など"] },
    { title: "ご用意いただくもの", items: ["文章・画像・ロゴ、アプリの用途と必要な機能の一覧", "ストア公開をする場合は、Google Playなどの開発者アカウントの費用（Google Playは登録料25ドル・1回）"] },
    { title: "対応していないこと", items: ["決済機能、チャット・通話などの常時接続機能、大量データの処理", "公開後の運用・障害対応・継続保守", "ストア審査の通過の保証", "サーバー費が発生する構成（事前にご案内し、同意をいただいた場合を除く）"] },
    { title: "修正と検収", items: ["各プランに、無料の修正3回（一覧の範囲内の調整）が含まれます。", "検収後の不具合は、納品から30日以内に再現できるものを無償で修正します。", "仕様の変更・追加は、別見積もりです。"] },
];

export default function ContractAppPage() {
    return (
        <div className="w-full text-gray-800 pb-32">
            <ContractHero
                category="Contract / App"
                title="アプリ制作"
                tagline="範囲を決めた、定額で。"
                body="用途がはっきりした小さなアプリを、Flutterで制作します。1つのコードから、WebとAndroidに対応できます。機能と画面を先に決めて、その範囲で定額にします。"
            />

            <div className="container mx-auto px-6 max-w-5xl flex flex-col gap-12">
                <ContractSection title="見積もり">
                    <p className="text-gray-700 leading-relaxed mb-6">
                        種類と画面の数、オプションを選ぶと、見積もりの目安が出ます。金額は目安で、機能・画面の一覧をお伺いしてから確定します。
                    </p>
                    <EstimateSimulator kind="app" />
                </ContractSection>

                <ContractFlow steps={flow} />
                <ContractNotes sections={sections} />

                <section className={`${cardClass} p-8 md:p-12`}>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-wider mb-4">制作実績</h2>
                    <p className="text-gray-700 leading-relaxed">
                        メッセージアプリ「DaiDai」を、Flutter・Firebase・WebRTCで個人で設計・開発・運用しています（Web・Android・Windows・Linuxに対応）。
                    </p>
                </section>

                <ContractFooter disclaimer="納品後のOS・ブラウザ・外部サービスの仕様変更による動作への影響、ストア審査の結果、お客様名義のアカウントの停止などについて、当方は責任を負いかねます。損害賠償の範囲は、受領した報酬額を上限とします。" />
            </div>
        </div>
    );
}
