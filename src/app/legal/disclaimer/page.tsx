import { Metadata } from "next";

export const metadata: Metadata = {
    title: "免責事項 | Rhing",
    description: "Rhingにおける免責事項についてご説明します。",
};

const disclaimers = [
    {
        title: "サービスの提供について",
        content: "Rhingは、本サービスの安定的な提供に努めますが、サーバーメンテナンス・システム障害・天災・通信障害等が発生した場合、サービスを停止することが有ります。サービス停止による損害について、Rhingは一切の責任を負いません。"
    },
    {
        title: "コンテンツについて",
        content: "ユーザーが投稿したコンテンツの内容について、Rhingは一切の責任を負いません。また、ユーザー間のトラブルについて、Rhingは仲介・解決の義務を負いません。"
    },
    {
        title: "セキュリティについて",
        content: "Rhingは、最善のセキュリティ対策を講じますが、完全な安全性を保証するものではありません。不正アクセスやデータ漏洩による損害について、Rhingの故意または重過失が有る場合を除き、責任を負いません。"
    },
    {
        title: "アカウントの復旧について",
        content: "Rhingは氏名・電話番号・メールアドレス等の個人情報を一切収集していない為、ユーザー自身の不注意によりログイン情報(Rhing Seed等)を紛失し、ログインができなくなった場合、本人確認を行う手段が無くアカウントを復旧することができません。これによりユーザーに生じた損害について、Rhingは一切の責任を負いません。"
    },
    {
        title: "リンク先について",
        content: "本サービスから外部サイトへのリンクが含まれる場合が有りますが、リンク先の内容について、Rhingは一切の責任を負いません。他社のサービス名やロゴの扱いについては、利用規約の第8条をご覧ください。"
    },
    {
        title: "損害賠償の制限",
        content: "Rhingの責に帰すべき事由によりユーザーに損害が生じた場合、Rhingがユーザーから受領した直近3ヶ月分の利用料金を上限として賠償します。"
    },
];

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-6 pb-32 max-w-4xl">
            {/* ページタイトル。ブロックは付けない（概要ページに揃える） */}
            <div className="mb-16 relative flex flex-col items-center justify-center text-center md:min-h-40 lg:min-h-48">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">DISCLAIMER</h1>
                <p className="text-on-surface-subtle tracking-wider text-sm">免責事項</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {disclaimers.map((item, index) => (
                    /* 
                      🌟 修正ポイント2: 条文カードをガラスデザイン仕様に変更 
                      - 黒の太い左境界線（border-l-4 border-l-gray-900）は維持しています。
                      - bg-surface-container-lowest/40 (半透明), backdrop-blur-md, border-glass-edge/80 (他3辺の境界線) を設定しています。
                      - ホバー時には、明るいガラス（hover:bg-surface-container-lowest/60）とほのかなブルーの影（hover:shadow-blue-300/10）へ滑らかに遷移します。
                    */
                    <section
                        key={index}
                        className="bg-surface-container-lowest/40 backdrop-blur-md p-8 md:p-10 border border-glass-edge/80 border-l-4 border-l-gray-900 shadow-elevation-1 rounded-r-m3-lg hover:bg-surface-container-lowest/60 hover:shadow-elevation-3 transition-all duration-500"
                    >
                        {/* 🌟 区切り線をガラスの透過率に合うように微調整 */}
                        <h3 className="text-xl font-bold text-on-surface mb-6 tracking-wide border-b border-on-surface/10 pb-4">
                            {item.title}
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                            {item.content}
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}