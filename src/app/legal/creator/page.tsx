import { Metadata } from "next";

export const metadata: Metadata = {
    title: "クリエイター向けポリシー | Rhing",
    description: "Rhingのロゴやサービス名を作品内で使用する際のポリシーです。",
};

export default function CreatorPolicyPage() {
    return (
        <div className="container mx-auto px-6 pb-32 max-w-4xl">
            {/* ページタイトル */}
            {/* 🌟 修正ポイント1: タイトルエリアをガラスカードのデザインに変更 */}
            <div className="mb-24 relative flex flex-col items-center justify-center text-center py-10 px-8 md:px-14 md:min-h-44 lg:min-h-52 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/terms.svg" alt="" className="hidden xl:block absolute right-full -mr-10 top-1/2 -translate-y-1/2 w-40 h-auto" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">CREATOR POLICY</h1>
                <p className="text-gray-500 tracking-wider text-sm">クリエイター向けポリシー</p>
            </div>

            <article className="space-y-12">

                {/* 作品内での使用許可 */}
                {/* 
                  🌟 修正ポイント2: セクションカードをガラスデザインに変更
                  - bg-white/40 (半透明), backdrop-blur-md, border-white/80
                */}
                <section className="bg-white/40 backdrop-blur-md p-8 md:p-12 border border-white/80 border-l-4 border-l-gray-900 shadow-md shadow-gray-200/20 rounded-r-2xl hover:bg-white/60 hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-wide border-b border-gray-900/10 pb-4">作品内での使用許可</h2>
                    <p className="text-gray-700 leading-loose text-lg font-medium mb-10">
                        Rhingは、クリエイターによる自由な表現を尊重します。以下の条件で、商用・非商用を問わず、Rhingのロゴやサービス名を作品内で使用することを無償で許可します。
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 許可される使用例 */}
                        {/* 🌟 修正ポイント3: 許可ボックスをグリーンカラーの半透明ガラス仕様に変更 */}
                        <div className="bg-green-500/10 backdrop-blur-sm p-6 rounded-xl border border-green-500/20">
                            <h4 className="font-bold text-green-950 mb-4 flex items-center">
                                <span className="mr-2">○</span> 許可される使用例
                            </h4>
                            <ul className="list-disc pl-5 space-y-2 text-green-800 text-sm">
                                <li>書籍・映像作品での登場</li>
                                <li>キャラクターが使用するアプリとして描写</li>
                                <li>ロゴの改変・パロディ化</li>
                                <li>悪役が使う、犯罪シーンで使う等の描写</li>
                            </ul>
                        </div>

                        {/* 禁止される使用例 */}
                        {/* 🌟 修正ポイント4: 禁止ボックスをレッドカラーの半透明ガラス仕様に変更 */}
                        <div className="bg-red-500/10 backdrop-blur-sm p-6 rounded-xl border border-red-500/20">
                            <h4 className="font-bold text-red-950 mb-4 flex items-center">
                                <span className="mr-2">×</span> 禁止される使用例
                            </h4>
                            <ul className="list-disc pl-5 space-y-2 text-red-800 text-sm">
                                <li>事実と異なる表現<br></br>（例：個人情報の漏洩・データの売却）</li>
                                <li>誤解を招く実在しない機能の描写</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 方針 */}
                <section className="bg-white/40 backdrop-blur-md p-8 md:p-12 border border-white/80 border-l-4 border-l-gray-900 shadow-md shadow-gray-200/20 rounded-r-2xl hover:bg-white/60 hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-wide border-b border-gray-900/10 pb-4">方針</h2>
                    <ul className="list-disc pl-6 space-y-4 text-gray-700 leading-relaxed text-lg font-medium">
                        <li>表現の自由を最大限尊重し、作品内での使用について事前許可は不要です。</li>
                        <li>ただし、営業妨害に該当する描写については、抗議する権利を留保します。</li>
                    </ul>
                </section>

            </article>
        </div>
    );
}