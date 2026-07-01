import { Metadata } from "next";

export const metadata: Metadata = {
    title: "団体概要・理念 | Rhing",
    description: "Rhingの団体概要と、名前に込められた理念について",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">ABOUT</h1>
                <p className="text-gray-500 tracking-wider text-sm">団体概要・理念</p>
            </div>

            {/* 団体理念セクション */}
            <section className="mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    PHILOSOPHY
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">理念</span>
                </h2>

                <div className="bg-[#f8f8f8] p-8 md:p-14 rounded-2xl">
                    <h3 className="text-xl md:text-2xl font-bold mb-8 text-gray-900 tracking-wide border-l-4 border-[#333] pl-4">
                        【団体名の由来について】
                    </h3>
                    <p className="text-gray-700 leading-loose text-lg md:text-xl font-medium">
                        Rhingという名前は、代表の故郷であり日本有数の林檎の産地である長野県飯田市の「林檎（りんご）」と、人と人を結ぶ「輪（リング）」に由来しています。<br className="hidden md:block mt-6" />
                        我々は、飯田の地で代々受け継がれてきた「結」の精神をデジタル社会に実現することを目指しています。
                    </p>
                </div>
            </section>

            {/* 団体概要セクション */}
            <section>
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    PROFILE
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">概要</span>
                </h2>

                <div className="w-full">
                    <dl className="divide-y divide-gray-200 border-t border-b border-gray-200">
                        {/* 団体名 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">団体名</dt>
                            <dd className="text-gray-700">Rhing</dd>
                        </div>

                        {/* 設立 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">設立</dt>
                            <dd className="text-gray-700">2026年2月20日</dd> {/* ← 実際の設立日に書き換えてください */}
                        </div>

                        {/* 所在地 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">所在地</dt>
                            <dd className="text-gray-700">長野県下伊那郡豊丘村神稲4573-1</dd> {/* ← 実際の所在地に書き換えてください */}
                        </div>

                        {/* 代表者 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">代表者</dt>
                            <dd className="text-gray-700">畑中 新</dd> {/* ← 実際の代表者名に書き換えてください */}
                        </div>

                        {/* 事業内容 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">事業内容</dt>
                            <dd className="text-gray-700">
                                <ul className="list-none space-y-3">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">■</span>
                                        アプリ開発事業
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">■</span>
                                        コミュニティ運営・ユーザーサポート
                                    </li>
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>
        </div>
    );
}