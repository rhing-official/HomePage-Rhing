import { Metadata } from "next";

export const metadata: Metadata = {
    title: "プライバシーポリシー | Rhing",
    description: "Rhingのプライバシーポリシー（個人情報の取り扱い）についてご説明します。",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-6 py-32 max-w-4xl">
            {/* タイトル */}
            <div className="mb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">PRIVACY POLICY</h1>
                <p className="text-gray-500 tracking-wider text-sm">プライバシーポリシー</p>
            </div>

            {/* 🌟 ページ全体を統一したスペース設定で管理します */}
            <div className="space-y-16">

                {/* 基本方針 */}
                <section className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-wide border-b border-gray-100 pb-4">基本方針</h2>
                    <p className="text-gray-700 leading-loose text-lg font-medium mb-6">
                        Rhingは、ユーザーのプライバシーを最優先します。私たちは、以下の情報を一切収集しません。
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                        {["メールアドレス", "電話番号", "住所", "位置情報", "マイナンバー"].map((item) => (
                            <li key={item} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                                <span className="text-red-500 font-bold">・</span> {item}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 収集する情報テーブル */}
                <section className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-wide border-b border-gray-100 pb-4">収集する情報</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* ... (中身は同じ) ... */}
                            <thead className="bg-gray-900 text-white">
                                <tr><th className="p-4 rounded-tl-lg">項目</th><th className="p-4">目的</th><th className="p-4 rounded-tr-lg">保存期間</th></tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {[
                                    { k: "Rhing ID", p: "アカウント識別", t: "アカウント削除まで" },
                                    { k: "パスワード（ハッシュ化）", p: "認証", t: "アカウント削除まで" },
                                    { k: "メッセージ内容", p: "サービス提供", t: "ユーザーが削除するまで" },
                                    { k: "決済情報", p: "購入履歴管理", t: "法令で定められた期間" },
                                    { k: "デバイスID", p: "セキュリティ", t: "アカウント削除まで" },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-4 font-bold">{row.k}</td><td className="p-4">{row.p}</td><td className="p-4">{row.t}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* データの取り扱い */}
                <section className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 tracking-wide border-b border-gray-100 pb-4">データの取り扱い</h2>

                    {/* 🌟 divを入れ子にせず、各アイテムに直接 mb-16 (大きな下マージン) を設定します */}
                    <div className="text-gray-800">

                        <div className="mb-16"> {/* 1. 暗号化 */}
                            <h4 className="text-2xl font-bold text-gray-900 mb-6">1. 暗号化</h4>
                            <ul className="list-disc pl-6 space-y-3 leading-relaxed text-lg text-gray-700">
                                <li>すべての通信はTLS 1.3で暗号化</li>
                                <li>メッセージはE2E暗号化（運営も閲覧不可）</li>
                            </ul>
                        </div>

                        <div className="mb-16"> {/* 2. 第三者提供 */}
                            <h4 className="text-2xl font-bold text-gray-900 mb-6">2. 第三者提供</h4>
                            <ul className="list-disc pl-6 space-y-3 leading-relaxed text-lg text-gray-700">
                                <li>Rhingは、ユーザーの個人情報を第三者に提供・売却しません</li>
                                <li>法令に基づく開示請求があった場合も、最小限の範囲で対応</li>
                            </ul>
                        </div>

                        <div> {/* 3. データ削除 */}
                            <h4 className="text-2xl font-bold text-gray-900 mb-6">3. データ削除</h4>
                            <ul className="list-disc pl-6 space-y-3 leading-relaxed text-lg text-gray-700">
                                <li>アカウント削除時、3時間以内に全データを完全削除</li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* 第三者サービステーブル */}
                <section className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-wide border-b border-gray-100 pb-4">第三者サービス</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900 text-white">
                                    <th className="p-4 rounded-tl-lg">サービス</th>
                                    <th className="p-4">用途</th>
                                    <th className="p-4 rounded-tr-lg">ユーザーデータ</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                <tr className="border-b border-gray-100">
                                    <td className="p-4 font-bold">Stripe</td>
                                    <td className="p-4">決済処理</td>
                                    <td className="p-4 text-sm">決済情報（クレジットカード情報はStripeが管理）</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="p-4 font-bold">Google Cloud Platform</td>
                                    <td className="p-4">サーバー・データベース</td>
                                    <td className="p-4 text-sm">メッセージ、ユーザー情報（暗号化済み）</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ユーザーの権利 */}
                <section className="bg-white p-8 md:p-12 border-l-4 border-gray-900 shadow-sm rounded-r-2xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-wide border-b border-gray-100 pb-4">ユーザーの権利</h2>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
                        <li>データの開示請求</li>
                        <li>データの訂正・削除請求</li>
                        <li>サービス利用の停止・アカウント削除請求</li>
                    </ul>
                </section>
            </div>
        </div >
    );
}