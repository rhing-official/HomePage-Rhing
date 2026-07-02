import { Metadata } from "next";

export const metadata: Metadata = {
    title: "免責事項 | Rhing",
    description: "Rhingにおける免責事項についてご説明します。",
};

const disclaimers = [
    {
        title: "サービスの提供について",
        content: "Rhingは、本サービスの安定的な提供に努めますが、サーバーメンテナンス、システム障害、不可抗力（天災、戦争、通信障害等）が発生した場合、サービスを停止することがあります。サービス停止による損害について、Rhingは一切の責任を负いません。"
    },
    {
        title: "コンテンツについて",
        content: "ユーザーが投稿したコンテンツの内容について、Rhingは一切の責任を負いません。また、ユーザー間のトラブルについて、Rhingは仲介・解決の義務を負いません。"
    },
    {
        title: "セキュリティについて",
        content: "Rhingは、最善のセキュリティ対策を講じますが、完全な安全性を保証するものではありません。不正アクセスやデータ漏洩による損害について、Rhingの故意または重過失がある場合を除き、責任を負いません。"
    },
    {
        title: "リンク先について",
        content: "本サービスから外部サイトへのリンクが含まれる場合がありますが、リンク先の内容について、Rhingは一切の責任を負いません。"
    },
    {
        title: "損害賠償の制限",
        content: "Rhingの責に帰すべき事由によりユーザーに損害が生じた場合、Rhingがユーザーから受領した直近3ヶ月分の利用料金を上限として賠償します。"
    },
];

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-6 py-32 max-w-4xl">
            {/* ページタイトル */}
            {/* 🌟 修正ポイント1: タイトルエリアをガラスカードのデザインに変更 */}
            <div className="mb-24 text-center py-10 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DISCLAIMER</h1>
                <p className="text-gray-500 tracking-wider text-sm">免責事項</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {disclaimers.map((item, index) => (
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
                            {item.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg font-medium">
                            {item.content}
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}