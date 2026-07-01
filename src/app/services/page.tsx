import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "サービス紹介 | Rhing",
    description: "Rhingが提供するサービスについて",
};

// サービス一覧のデータ
const services = [
    {
        id: "zakuro",
        name: "zakuro", // kuwaから変更
        tagline: "本と、二人きり。", // ここに追加
        category: "Book Reader",
        description: "以前から複数プラットフォームで同じ使用感で利用できる電子書籍リーダーを作りたかったので作ろうと思いました。現在鋭意開発中です。3月中の公開を目指していますが、4月までずれ込むかもしれません。手元にMacがないのでiOS,MacOS版のリリースは目処が立つまでお預けになります。ごめんなさい。",
        features: ["CBZ,PDFの読み込み", "設定のカスタマイズ化", "Android,Linux,Windows,iOS,macOS対応"],
        link: "/services/zakuro",
        bgColor: "bg-gray-200",
    },
    {
        id: "daidai",
        name: "DaiDai",
        tagline: "整う、守る、私に馴染む。", // ここに追加
        category: "Messages",
        description: "プライバシーを守る、メッセージアプリ。広告なし、電話番号・メールアドレス不要で、あなたのデータを売却しません。家族や友人との語らいから、コミュニティでの交流まで、安心して繋がれる場所を提供します。",
        features: ["厳重なプライバシー保護", "広告なし", "電話番号・メアド不要", "Android,Linux,Windows,iOS,macOS,Web対応"],
        link: "/services/daidai",
        bgColor: "bg-gray-300",
    }
];

export default function ServicesPage() {
    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">SERVICES</h1>
                    <p className="text-gray-500 tracking-wider text-sm">サービス紹介</p>
                </div>
            </div>
            {/* サービス一覧セクション */}
            <div className="flex flex-col gap-32">
                {services.map((service, index) => {
                    // 偶数番目は画像が左、奇数番目は画像が右になるようにレイアウトを反転
                    const isEven = index % 2 === 0;

                    return (
                        <section key={service.id} className="container mx-auto px-6 max-w-6xl overflow-hidden">
                            <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}>

                                {/* 画像（モックアップ）エリア */}
                                <div className="w-full lg:w-1/2 aspect-[4/3] md:aspect-[16/9] lg:aspect-square relative group overflow-hidden rounded-2xl shadow-sm">
                                    {/* ▼ 実際の画像が用意できたら、ここを <Image /> コンポーネントに差し替えます */}
                                    <div className={`absolute inset-0 w-full h-full ${service.bgColor} flex items-center justify-center transition-transform duration-700 group-hover:scale-105`}>
                                        <span className="text-gray-400 font-bold tracking-widest text-xl border border-gray-400 p-4">
                                            {service.name} Image
                                        </span>
                                    </div>
                                </div>

                                {/* テキストエリア */}
                                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">
                                        {service.category}
                                    </span>

                                    {/* キャッチコピーを追加 */}
                                    <p className="text-lg font-medium text-gray-400 mb-2 tracking-widest">
                                        {service.tagline}
                                    </p>

                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-wider">
                                        {service.name}
                                    </h2>

                                    <p className="text-gray-700 leading-relaxed text-lg mb-8">
                                        {service.description}
                                    </p>

                                    {/* 特徴リスト */}
                                    <ul className="space-y-3 mb-12">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-gray-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-[#111] rounded-full mr-3 block"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* 詳細ボタン */}
                                    <Link
                                        href={service.link}
                                        className="inline-flex items-center gap-4 text-sm font-bold tracking-widest text-gray-900 group"
                                    >
                                        <span className="group-hover:text-gray-500 transition-colors">VIEW MORE</span>
                                        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                                            <ArrowRight className="w-4 h-4 group-hover:text-white transition-colors" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}