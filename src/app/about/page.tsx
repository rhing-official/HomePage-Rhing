import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "団体概要・理念 | Rhing",
    description: "Rhingの団体概要と、名前に込められた理念について",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-6 pb-24 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-16 relative flex flex-col items-center justify-center text-center md:min-h-40 lg:min-h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/founding-team.svg" alt="" className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-48 lg:w-56 h-auto" />
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
                        Rhingという名前は、代表者の故郷であり日本有数の林檎の産地である長野県飯田市の「林檎（りんご）」と、人と人を結ぶ「輪（リング）」に由来しています。<br className="hidden md:block mt-6" />
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
                            <dd className="text-gray-700">2026/2/20</dd> {/* ← 実際の設立日に書き換えてください */}
                        </div>

                        {/* 代表者 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">代表者</dt>
                            <dd className="text-gray-700 flex items-center gap-3">
                                畑中 新 {/* ← 実際の代表者名に書き換えてください */}
                                <a
                                    href="https://github.com/arag616"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GitHub"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://note.com/arag616"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="note"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                        <path d="M0 .279c4.623 0 10.953-.235 15.498-.117 6.099.156 8.39 2.813 8.468 9.374.077 3.71 0 14.335 0 14.335h-6.598c0-9.296.04-10.83 0-13.759-.078-2.578-.814-3.807-2.795-4.041-2.097-.235-7.975-.04-7.975-.04v17.84H0Z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://www.pixiv.net/users/94193546"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="pixiv"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:bg-gray-900 hover:border-gray-900 transition-colors"
                                >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                        <path d="M4.94 0A4.953 4.953 0 0 0 0 4.94v14.12A4.953 4.953 0 0 0 4.94 24h14.12A4.953 4.953 0 0 0 24 19.06c-.014 1.355 0-14.12 0-14.12A4.953 4.953 0 0 0 19.06 0Zm1.783 5.465h.904a.37.37 0 0 1 .31.17l.752 1.17a6.172 6.172 0 0 1 10.01 4.834 6.172 6.172 0 0 1-9.394 5.265v2.016a.37.37 0 0 1-.37.367H6.724a.37.37 0 0 1-.37-.367V5.834a.37.37 0 0 1 .37-.37m5.804 2.951a3.222 3.222 0 1 0-.002 6.443 3.222 3.222 0 0 0 .002-6.443" />
                                    </svg>
                                </a>
                            </dd>
                        </div>

                        {/* 事業内容 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">事業内容</dt>
                            <dd className="text-gray-700">
                                <ul className="list-none space-y-3">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">■</span>
                                        アプリ開発
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">■</span>
                                        コミュニティ運営
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-gray-400">■</span>
                                        ユーザーサポート
                                    </li>
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* 特定商取引法に基づく表記セクション */}
            <section id="tokushoho" className="mt-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    LEGAL NOTICE
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">特定商取引法に基づく表記</span>
                </h2>

                <div className="w-full">
                    <dl className="divide-y divide-gray-200 border-t border-b border-gray-200">
                        {/* 販売事業者 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">販売事業者</dt>
                            <dd className="text-gray-700">Rhing</dd>
                        </div>

                        {/* 運営統括責任者 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">運営統括責任者</dt>
                            <dd className="text-gray-700">畑中 新</dd>
                        </div>

                        {/* 所在地 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">所在地</dt>
                            <dd className="text-gray-700">請求がございましたら、遅滞なく開示いたします</dd>
                        </div>

                        {/* 電話番号 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">電話番号</dt>
                            <dd className="text-gray-700">請求がございましたら、遅滞なく開示いたします</dd>
                        </div>

                        {/* お問い合わせ */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">お問い合わせ</dt>
                            <dd className="text-gray-700">
                                <Link href="/contact?type=user" className="underline hover:text-gray-900 transition-colors">
                                    お問い合わせフォーム
                                </Link>
                                よりご連絡ください
                            </dd>
                        </div>

                        {/* 販売価格 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">販売価格</dt>
                            <dd className="text-gray-700">各商品ページに記載の税込価格</dd>
                        </div>

                        {/* 商品代金以外の必要料金 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">商品代金以外の必要料金</dt>
                            <dd className="text-gray-700">別途手数料が発生する場合は各商品ページに明記します</dd>
                        </div>

                        {/* 支払方法 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">支払方法</dt>
                            <dd className="text-gray-700">クレジットカード決済</dd>
                        </div>

                        {/* 支払時期 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">支払時期</dt>
                            <dd className="text-gray-700">決済完了時</dd>
                        </div>

                        {/* 引渡時期 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">引渡時期</dt>
                            <dd className="text-gray-700">決済完了後、直ちにご利用いただけます</dd>
                        </div>

                        {/* 返品・キャンセル */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">返品・キャンセル</dt>
                            <dd className="text-gray-700">
                                デジタルコンテンツの性質上、購入後の返品・キャンセルはお受けできません。
                                不具合がある場合は、<Link href="/contact?type=user" className="underline hover:text-gray-900 transition-colors">
                                    お問い合わせフォーム
                                </Link>よりご連絡ください
                            </dd>
                        </div>

                        {/* 動作環境 */}
                        <div className="py-8 flex flex-col md:flex-row gap-4 md:gap-12 hover:bg-gray-50 transition-colors px-4">
                            <dt className="w-48 shrink-0 font-bold text-gray-900 tracking-wider">動作環境</dt>
                            <dd className="text-gray-700">daidai横丁内でご利用いただけます</dd>
                        </div>
                    </dl>
                </div>
            </section>
        </div>
    );
}