import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rhing憲章 | Rhing",
    description: "Rhingが掲げる運営理念とユーザーとの誓いを記した憲章です。",
};

// 条文を配列で管理することで、コードをスッキリさせます
const articles = [
    { title: "前文", content: "Rhingは、ユーザー一人ひとりの自由と尊厳を守り、表現者が正当な対価を得られる、透明で持続可能なデジタル空間を創造します。私たちは、広告やデータ売却に依存せず、ユーザーとの信頼関係に基づくサブスクリプションモデルを採用し、すべてのステークホルダーに誠実であることを誓います。" },
    { title: "第一条：ユーザーの自由と尊厳", content: "Rhingは、いかなる権力や資本からもユーザーの自由を守る。運営による発言の不当な削除や改ざんは、これを永久に禁ずる。ユーザーは自らの意思で情報を発信し、交流し、表現する権利を有する。" },
    { title: "第二条：情報の独立", content: "ユーザーのプライバシーは、国家や企業による情報の独占・買収から死守する。国との連携においても、個人情報の開示や管理権限の譲渡には、未来永劫応じない。マイナンバー、電話番号、住所の登録・連携は、これを一切行わない。" },
    { title: "第三条：クリエイターの正当な利益", content: "「守る」という言葉は、表現者の権利と生活、そして利益も守ることを意味する。巨大なプラットフォームによる搾取を排除し、クリエイターに正当な対価が届く仕組みを維持する。手数料は最小限に抑え、透明性を保つ。" },
    { title: "第四条：個人情報の不保持", content: "マイナンバー、電話番号、住所、メールアドレス、位置情報の登録・連携は、これを一切行わない。ユーザーは匿名性を保ちながら、信頼できるID（Rhing seed）を持つ権利を有する。" },
    { title: "第五条：美学としての「整う」", content: "広告や過剰な機能を排除し、情報の視認性と使い心地を最優先する。ユーザーの時間を奪う「ごちゃごちゃ感」を許さない。シンプルで美しく、本質的な価値を提供する。" },
    { title: "第六条：透明性と説明責任", content: "運営方針、収益構造、データの取り扱いについて、ユーザーに対して常に透明であることを約束する。重要な変更については事前に説明し、ユーザーの意見を尊重する。" },
    { title: "第七条：買収と売却の禁止", content: "Rhingは、いかなる買収や事業売却にも応じない。ユーザーとの信頼関係を守るため、この憲章に反する資本や権力の介入を拒否する。" },
];

export default function CharterPage() {
    return (
        <div className="container mx-auto px-6 py-32 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">CHARTER</h1>
                <p className="text-gray-500 tracking-wider text-sm">Rhing憲章</p>
            </div>

            {/* 条文リスト */}
            <div className="space-y-12">
                {articles.map((article, index) => (
                    <section
                        key={index}
                        className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl hover:shadow-md transition-shadow"
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-wide border-b border-gray-100 pb-4">
                            {article.title}
                        </h3>
                        <p className="text-gray-700 leading-loose text-lg font-medium">
                            {article.content}
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}