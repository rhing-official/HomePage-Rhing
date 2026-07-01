import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "zakuro | Rhing",
    description: "本と、二人きり。PDF・CBZ対応のミニマルな電子書籍リーダー",
};

export default function ZakuroPage() {
    const features = [
        { icon: "📚", title: "木目調の本棚", desc: "フォルダをそのまま本棚に。サムネイルが並ぶグリッド表示で、大切な本を一覧できる。" },
        { icon: "📖", title: "迷わない読書画面", desc: "画面をタップするだけでページをめくる。余計なアニメーションなし、即時切り替え。" },
        { icon: "🔖", title: "しおりを挟む", desc: "最後に読んだページを自動で記録。次に開いた時、続きからすぐ読める。" },
        { icon: "⌨️", title: "キーボードでも快適に", desc: "PC版はキーボード操作に対応。矢印キーでページ送り、Spaceでメニュー切り替え。" },
    ];

    return (
        <div className="w-full bg-[#fdfbf7] text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">zakuro</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-12">「本と、二人きり。」</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition">Android</button>
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition">iOS</button>
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition">Windows</button>
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition">macOS</button>
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-700 transition">Linux</button>
                </div>
            </div>

            {/* コンセプト */}
            <section className="container mx-auto px-6 py-20 text-center max-w-2xl">
                <h2 className="text-2xl font-bold mb-8 tracking-widest">読む時間は、あなただけのもの</h2>
                <p className="leading-relaxed text-lg">
                    余計な通知もない、広告もない。ただ本だけがある空間。<br />
                    自分のデバイスにある本を、自分のペースで読む。<br />
                    それだけのために、zakuroはある。
                </p>
            </section>

            {/* 主要機能 */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* フォーマットと注意書き */}
            <section className="container mx-auto px-6 py-20 text-center">
                <div className="flex flex-col md:flex-row justify-center gap-12 mb-8">
                    <div className="p-8 border-b-2 border-gray-900">
                        <h4 className="text-2xl font-bold mb-2">PDF (.pdf)</h4>
                        <p className="text-gray-500">電子書籍・文書</p>
                    </div>
                    <div className="p-8 border-b-2 border-gray-900">
                        <h4 className="text-2xl font-bold mb-2">CBZ (.cbz / .zip)</h4>
                        <p className="text-gray-500">コミック・画像集</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 tracking-widest italic">※ローカルのファイルを読み込むだけ。アカウント登録もクラウド同期も不要。</p>
            </section>
        </div>
    );
}