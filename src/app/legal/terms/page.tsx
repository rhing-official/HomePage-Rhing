import { Metadata } from "next";

export const metadata: Metadata = {
    title: "利用規約 | Rhing",
    description: "Rhingをご利用いただく際の利用規約です。",
};

const terms: { title: string; content: string; items?: string[] }[] = [
    { title: "第1条：定義", content: "「Rhing」とは、本サービスおよびこれを運営する事業主を指します。「ユーザー」とは、本サービスを利用する全ての人を指します。" },
    { title: "第2条：利用資格", content: "ユーザーは、自己の責任において本サービスを利用するものとします。13歳未満の方は、保護者の同意を得た上でご利用ください。" },
    { title: "第3条：アカウント管理", content: "ユーザーは、Rhing Seedとそれに関連するログイン情報を厳重に管理する責任を負います。第三者による不正利用が判明した場合、速やかにRhingに報告してください。" },
    {
        title: "第4条：禁止事項",
        content: "以下の行為を禁止します。",
        items: [
            "法令に違反する行為",
            "犯罪行為に関連する行為",
            "他者の権利を侵害する行為",
            "誹謗中傷、ハラスメント",
            "スパム送信、迷惑行為",
            "虚偽の情報を流布する行為",
            "本サービスの運営を妨害する行為",
        ],
    },
    { title: "第5条：コンテンツの権利", content: "ユーザーが投稿したコンテンツの著作権は、ユーザーに帰属します。Rhingは、ユーザー自身の指示に基づく保存・表示以外の目的でコンテンツを使用することはなく、宣伝・二次利用・販売・第三者への提供・AI学習等、Rhing自身の目的のために利用することは一切ありません。" },
    {
        title: "第6条：画面公開について",
        content: "ユーザーは、以下の条件を満たす場合、本サービスの画面を公開できます。",
        items: [
            "対話相手の事前同意を得ること",
            "相手の希望がある場合、個人を特定できる情報にマスキング処理を施すこと",
            "誹謗中傷や悪意ある編集をしないこと",
        ],
    },
    { title: "第7条：免責事項", content: "Rhingは、本サービスの完全性、正確性、有用性を保証しません。ユーザー間のトラブルについて、Rhingは一切の責任を負いません。天災、戦争、通信障害等によるサービス停止について、Rhingは責任を負いません。詳細は別途免責事項に記載とする。" },
    { title: "第8条：規約の変更", content: "Rhingは、必要に応じて本規約を変更することができます。変更する際には、運営メッセージ・公式Discordサーバーを通じて事前にユーザーに通知します。" },
    { title: "第9条：準拠法・管轄裁判所", content: "本規約は、日本国法に準拠します。本サービスに関する紛争は、長野地方裁判所を専属的合意管轄裁判所とします。" },
];

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 pb-32 max-w-4xl">
            {/* ページタイトル */}
            {/* 🌟 修正ポイント1: タイトルエリアをガラスカードのデザインに変更 */}
            <div className="mb-24 relative flex flex-col items-center justify-center text-center py-10 px-8 md:px-14 md:min-h-44 lg:min-h-52 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/terms.svg" alt="" className="hidden xl:block absolute right-full -mr-10 top-1/2 -translate-y-1/2 w-40 h-auto" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">TERMS OF SERVICE</h1>
                <p className="text-gray-500 tracking-wider text-sm">利用規約</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {terms.map((term, index) => (
                    /* 
                      🌟 修正ポイント2: 条文カードをガラスデザイン仕様に変更 
                      - 黒の太い左境界線（border-l-4 border-l-gray-900）は維持しています。
                      - bg-white/40 (半透明), backdrop-blur-md, border-white/80 (他3辺の境界線) を設定しています。
                      - ホバー時には、明るいガラス（hover:bg-white/60）とほのかなブルーの影（hover:shadow-blue-300/10）へ滑らかに遷移します。
                    */
                    <section
                        key={index}
                        className="bg-white/40 backdrop-blur-md p-8 md:p-10 border border-white/80 border-l-4 border-l-gray-900 shadow-md shadow-gray-200/20 rounded-r-2xl hover:bg-white/60 hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500"
                    >
                        {/* 🌟 区切り線をガラスの透過率に合うように微調整 */}
                        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-wide border-b border-gray-900/10 pb-4">
                            {term.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg font-medium">
                            {term.content}
                        </p>
                        {term.items && (
                            <ol className="list-decimal pl-6 mt-4 space-y-2 text-gray-700 leading-relaxed text-lg font-medium">
                                {term.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ol>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}