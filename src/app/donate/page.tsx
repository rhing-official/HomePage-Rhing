import { Metadata } from "next";
import Link from "next/link";
import DonateMethods from "@/components/DonateMethods";

// 支払い機能の公開準備が整うまで検索に出さない
export const metadata: Metadata = {
    title: "寄付・支援 | Rhing",
    description: "Rhingの活動を支援する寄付のご案内",
    robots: { index: false, follow: false },
};

const faqs = [
    {
        q: "寄付はいつから受け付けますか？",
        a: "クレジット・デビット、Apple Pay・Google Pay、ビットコインでの寄付は、現在受け付けています。PayPayは準備中で、受付を開始した際は、noteとDiscord公式サーバーでお知らせします。",
    },
    {
        q: "カードでの寄付に、最低額はありますか？",
        a: "50円以上で、金額はご自身で入力できます。お支払い後の返金はできません。",
    },
    {
        q: "ビットコインでの寄付に、最低額はありますか？",
        a: "ネットワーク手数料の都合で、最低額があります。目安は約0.0002625BTCです。ネットワーク手数料はお支払いになる方の負担で、お支払い後の返金はできません。",
    },
    {
        q: "ご支援の一部が、環境のために寄付されるというのは何ですか？",
        a: "Stripeを通じたお支払いの金額の1%を、Stripe Climateを通じて、大気中のCO₂を除去する事業へ寄付しています。寄付者に追加の負担はありません。",
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

            {/* 受付状況の案内 */}
            <div className="mb-16 text-center bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 md:p-10">
                <p className="text-gray-900 font-bold tracking-wider mb-2">現在は、クレジット・デビット、Apple Pay・Google Pay、ビットコインで受け付けています</p>
                <p className="text-gray-600 leading-relaxed text-sm">
                    PayPayは準備中です。<br className="hidden md:block" />
                    受付を開始した際は、noteとDiscord公式サーバーでお知らせします。
                </p>
            </div>

            {/* 趣旨 */}
            <section className="mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    SUPPORT
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">Rhingを支援するということ</span>
                </h2>
                <div className="bg-[#f8f8f8] p-8 md:p-14 rounded-2xl">
                    <p className="text-gray-700 leading-loose text-lg">
                        Rhingは広告に頼らず、貴方のデータを売却しない形でサービスを運営する事を目指しています。
                        頂いた寄付は、サービスの開発・運営の継続に役立てます。
                        かもしれませんし、代表者のお小遣いになるかもしれません。
                        ビットコイン以外の支払い方法では、Stripe Climateを通じて大気中のCO₂を除去する事業へ寄付しています。
                    </p>
                    {/* TODO: 具体的な使い道（サーバー費用など）は方針が決まり次第ここに追記する */}
                </div>
            </section>

            {/* お支払い方法 */}
            <section className="mb-24">
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    METHOD
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">お支払い方法を選ぶ</span>
                </h2>
                <DonateMethods />
            </section>

            {/* よくある質問 */}
            <section>
                <h2 className="text-2xl font-bold mb-10 tracking-widest border-b border-gray-200 pb-4 text-gray-900">
                    FAQ
                    <span className="block text-sm text-gray-500 font-normal mt-2 tracking-normal">よくある質問</span>
                </h2>
                <dl className="divide-y divide-gray-200 border-b border-gray-200">
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
