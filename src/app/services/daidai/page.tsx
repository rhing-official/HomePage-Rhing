import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "DaiDai | Rhing",
    description: "整う、守る、私に馴染む。プライバシーを守る純国産メッセージアプリ",
};

export default function DaiDaiPage() {
    const features = [
        { icon: "💬", title: "メッセージ", desc: "1対1のメッセージ（路地）や、グループチャット（広場）。家族、友人、コミュニティ、それぞれに合った繋がり方を。" },
        { icon: "📞", title: "ビデオ通話", desc: "無料版で720p、有料プランで1080pの高画質通話。ノイズ抑制機能で、クリアな音声。" },
        { icon: "🔒", title: "厳重なプライバシー保護", desc: "電話番号・メアド不要、E2E暗号化、データ売却なし。あなたのプライバシーを守る。" },
        { icon: "🚫", title: "広告ゼロ", desc: "広告なし。サブスクリプションモデルで透明性の高い運営。" },
        { icon: "📱", title: "マルチプラットフォーム", desc: "Android・iOS・Webに対応。どこからでも安心して繋がれる。" },
    ];

    return (
        <div className="w-full bg-[#fdfbf7] text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DaiDai</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-12 text-amber-600">「整う、守る、私に馴染む。」</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">Android</button>
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">iOS</button>
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">Windows</button>
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">macOS</button>
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">Linux</button>
                    <button className="bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg">Web</button>
                </div>
            </div>

            {/* コンセプト：左寄せに変更 */}
            <section className="container mx-auto px-6 py-20 text-left max-w-3xl">
                <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900">私は、あなたと話したいだけ。</h2>
                <div className="space-y-4 leading-relaxed text-lg text-gray-700">
                    <p>プライバシーを守る、純国産メッセージアプリ。広告なし、電話番号・メールアドレス不要で、あなたのデータを売却しません。</p>
                    <p>家族や友人との語らい（路地）から、コミュニティでの交流（広場）まで、安心して繋がれる場所を提供します。</p>
                </div>
            </section>

            {/* 主要機能：左寄せに変更 */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 hover:border-amber-300 transition-colors">
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="text-lg font-bold mb-3 text-left">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-left">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 有料プラン：左寄せに変更 */}
            <section className="container mx-auto px-6 py-20 max-w-4xl">
                <h2 className="text-2xl font-bold mb-12 tracking-widest text-left">有料プラン</h2>
                <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-gray-400 text-xs uppercase tracking-widest">
                                <th className="p-6">機能</th>
                                <th className="p-6">無料</th>
                                <th className="p-6 text-amber-600">極み（¥980/月）</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {[
                                ["メッセージ", "✅", "✅"],
                                ["ビデオ通話", "720p", "1080p"],
                                ["ファイル転送", "2GBまで", "10GBまで"],
                                ["既読表示", "あり", "無効化可能"],
                            ].map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="p-6 font-bold text-gray-800">{row[0]}</td>
                                    <td className="p-6">{row[1]}</td>
                                    <td className="p-6 font-bold text-amber-600">{row[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* これからのDaiDai：左寄せに変更 */}
            <section className="container mx-auto px-6 py-20 text-left max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-amber-700">さらなる機能を、計画中</h2>
                <div className="space-y-2 text-gray-600">
                    <p>開発中なのでまだ公表はしませんが、その他の機能も計画しています。</p>
                    <p>あなたの日常に、もっと寄り添えるアプリへ。</p>
                    <p>とにかくまずは最小機能版の開発がんばります。</p>
                </div>
            </section>
        </div>
    );
}