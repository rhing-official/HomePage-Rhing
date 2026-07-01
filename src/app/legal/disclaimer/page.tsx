import { Metadata } from "next";

export const metadata: Metadata = {
    title: "免責事項 | Rhing",
    description: "Rhingにおける免責事項についてご説明します。",
};

const disclaimers = [
    {
        title: "サービスの提供について",
        content: "Rhingは、本サービスの安定的な提供に努めますが、サーバーメンテナンス、システム障害、不可抗力（天災、戦争、通信障害等）が発生した場合、サービスを停止することがあります。サービス停止による損害について、Rhingは一切の責任を負いません。"
    },
    {
        title: "コンテンツについて",
        content: "住人が投稿したコンテンツの内容について、Rhingは一切の責任を負いません。また、住人間のトラブルについて、Rhingは仲介・解決の義務を負いません。"
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
        content: "Rhingの責に帰すべき事由により住人に損害が生じた場合、Rhingが住人から受領した直近3ヶ月分の利用料金を上限として賠償します。"
    },
];

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-6 py-32 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DISCLAIMER</h1>
                <p className="text-gray-500 tracking-wider text-sm">免責事項</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {disclaimers.map((item, index) => (
                    <section
                        key={index}
                        className="bg-white p-8 md:p-10 border-l-4 border-gray-900 shadow-sm rounded-r-2xl"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-wide border-b border-gray-100 pb-4">
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