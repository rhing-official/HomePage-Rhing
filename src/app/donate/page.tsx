import { Metadata } from "next";
import Link from "next/link";

// 支払い機能の公開準備が整うまで検索に出さない
export const metadata: Metadata = {
    title: "寄付・支援 | Rhing",
    description: "Rhingの活動を支援する寄付のご案内",
    robots: { index: false, follow: false },
};

// 金額はいずれも仮の目安（受付開始時に確定する）
const amounts = [
    { label: "ちょっと応援", amount: "500円" },
    { label: "しっかり応援", amount: "1,000円" },
    { label: "たっぷり応援", amount: "3,000円" },
];

const faqs = [
    {
        q: "寄付はいつから受け付けますか？",
        a: "現在準備中です。受付を開始した際は、noteとDiscord公式サーバーでお知らせします。",
    },
    {
        q: "寄付をすると何か特典はありますか？",
        a: "特典の有無は受付開始までに決定し、このページに記載します。",
    },
    {
        q: "寄付は税控除の対象になりますか？",
        a: "Rhingへの寄付は、税制上の寄付金控除の対象にはなりません。詳細は受付開始時に改めて記載します。",
    },
];

export default function DonatePage() {
    return (
        <div className="container mx-auto px-6 pb-24 max-w-4xl">
            {/* ページタイトル */}
            <div className="mb-16 flex flex-col items-center justify-center text-center md:min-h-40 lg:min-h-48">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">DONATE</h1>
                <p className="text-gray-500 tracking-wider text-sm">寄付・支援</p>
            </div>

            {/* 準備中の案内 */}
            <div className="mb-16 text-center bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 md:p-10">
                <p className="text-gray-900 font-bold tracking-wider mb-2">現在、寄付の受付は準備中です</p>
                <p className="text-gray-600 leading-relaxed text-sm">
                    お支払いの仕組みを整えている最中のため、まだ寄付はできません。<br className="hidden md:block" />
                    開始までしばらくお待ちください。<br className="hidden md:block" />
                    支払い方法は以下を予定しています。
                </p>
                <ul className="mt-4 inline-block text-left list-disc pl-5 text-gray-700 text-sm leading-loose">
                    <li>クレジットカード</li>
                    <li>デビットカード</li>
                    <li>PayPay</li>
                    <li>ビットコイン</li>
                </ul>
            </div>

            {/* 趣旨 */}
            <section className="mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    SUPPORT
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">Rhingを支援するということ</span>
                </h2>
                <div className="bg-[#f8f8f8] p-8 md:p-14 rounded-2xl">
                    <p className="text-gray-700 leading-loose text-lg">
                        Rhingは、広告に頼らず、あなたのデータを売却しない形でサービスを運営する事を目指しています。
                        頂いた寄付は、サービスの開発・運営の継続に役立てます。
                    </p>
                    {/* TODO: 具体的な使い道（サーバー費用など）は方針が決まり次第ここに追記する */}
                </div>
            </section>

            {/* 金額の目安 */}
            <section className="mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    AMOUNT
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">金額の目安</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {amounts.map((item) => (
                        <div
                            key={item.amount}
                            className="bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 text-center"
                        >
                            <p className="text-gray-500 text-sm tracking-wider mb-3">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-6">{item.amount}</p>
                            <button
                                type="button"
                                disabled
                                className="w-full rounded-full bg-gray-200 text-gray-400 py-2 text-sm tracking-wider cursor-not-allowed"
                            >
                                準備中
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* よくある質問 */}
            <section>
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    FAQ
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">よくある質問</span>
                </h2>
                <dl className="divide-y divide-gray-200 border-t border-b border-gray-200">
                    {faqs.map((faq) => (
                        <div key={faq.q} className="py-8 px-4">
                            <dt className="font-bold text-gray-900 tracking-wider mb-3">{faq.q}</dt>
                            <dd className="text-gray-700 leading-relaxed">{faq.a}</dd>
                        </div>
                    ))}
                </dl>
                <p className="mt-10 text-center text-sm text-gray-500">
                    ご不明な点は
                    <Link href="/contact?type=user" className="underline underline-offset-4 hover:text-gray-900 transition-colors">
                        お問い合わせ
                    </Link>
                    からご連絡ください。
                </p>
            </section>
        </div>
    );
}
