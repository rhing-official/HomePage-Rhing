import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "サービス紹介 | Rhing",
    description: "Rhingが提供するサービスについて",
};

// サービス一覧のデータ
const services = [
    {
        id: "komichi",
        name: "komichi",
        tagline: "本と、二人きり。",
        category: "Book Reader",
        description: "以前から複数プラットフォームで同じ使用感で利用できる電子書籍リーダーを作りたかったので作ろうと思いました。現在鋭意開発中です。2026年中の公開を目指しています。手元にMacがないのでiOS,MacOS版のリリースは目処が立つまでお預けになります。ごめんなさい。",
        features: ["CBZ,PDFの読み込み", "設定のカスタマイズ化", "Android,Linux,Windows,iOS,macOS対応"],
        link: "/services/komichi",
        bgColor: "bg-gray-200/60",
    },
    {
        id: "daidai",
        name: "DaiDai",
        tagline: "整う、守る、私に馴染む。",
        category: "Messages",
        description: "プライバシーを守る、メッセージアプリ。広告なし、電話番号・メールアドレス不要で、あなたのデータを売却しません。家族や友人との語らいから、コミュニティでの交流まで、安心して繋がれる場所を提供します。",
        features: ["厳重なプライバシー保護", "広告なし", "電話番号・メアド不要", "Android,Linux,Windows,iOS,macOS,Web対応"],
        link: "/services/daidai",
        bgColor: "bg-gray-300/60",
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
            <div className="flex flex-col gap-20">
                {services.map((service) => {
                    return (
                        <section
                            key={service.id}
                            className="container mx-auto px-6 max-w-5xl bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16"
                        >
                            {/* 
                              🌟 修正ポイント:
                              `lg:flex-row-reverse` を固定値として指定します。
                              これにより、PC・タブレット横（lg以上）のときに、
                              HTMLの記述順に関わらず「文章（テキスト）が左、画像が右」で統一されます。
                            */}
                            <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-center">

                                {/* 画像（モックアップ）エリア（PCでは右側に配置されます） */}
                                <Link
                                    href={service.link}
                                    className="w-full lg:w-1/2 aspect-[4/3] md:aspect-[16/9] lg:aspect-square relative group overflow-hidden rounded-2xl shadow-sm block"
                                >
                                    {/* ▼ 実際の画像が用意できたら、ここを <Image /> コンポーネントに差し替えます */}
                                    <div className={`absolute inset-0 w-full h-full ${service.bgColor} flex items-center justify-center transition-transform duration-700 group-hover:scale-105`}>
                                        <span className="text-gray-400 font-bold tracking-widest text-xl border border-gray-400 p-4 transition-colors group-hover:text-gray-600 group-hover:border-gray-600">
                                            {service.name} Image
                                        </span>
                                    </div>
                                </Link>

                                {/* テキストエリア（PCでは左側に配置されます） */}
                                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">
                                        {service.category}
                                    </span>

                                    {/* キャッチコピー */}
                                    <p className="text-lg font-medium text-gray-400 mb-2 tracking-widest">
                                        {service.tagline}
                                    </p>

                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-wider">
                                        {service.name}
                                    </h2>

                                    <p className="text-gray-700 leading-relaxed text-base mb-8">
                                        {service.description}
                                    </p>

                                    {/* 特徴リスト */}
                                    <ul className="space-y-3 mb-0">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-gray-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-[#111] rounded-full mr-3 block"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}