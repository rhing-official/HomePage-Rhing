import { Metadata } from "next";
import CtaCard from "@/components/ui/CtaCard";
import { Gift, KeyRound, Palette, ArrowRight, Search, Heart, UserRound, Sparkles } from "lucide-react";

const title = "daidai横丁 | Rhing";
const description = "DaiDaiで使えるぺったんと意匠パックの横丁、daidai横丁について。当面は無料のものだけで、有料化の際の還元率の目標と、その算出の前提も載せています。";

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: "https://rhing.jp/services/daidai-yokocho" },
    openGraph: {
        title,
        description,
        url: "https://rhing.jp/services/daidai-yokocho",
        siteName: "Rhing",
        locale: "ja_JP",
        type: "website",
    },
    twitter: { card: "summary", title, description },
};

const contents = [
    { href: "#about", label: "ぺったんと意匠パック" },
    { href: "#howto", label: "使い方" },
    { href: "#fee", label: "還元率の算出の前提" },
    { href: "#github", label: "仕組みを見る" },
];

const pillars = [
    {
        icon: Gift,
        title: "当面は無料",
        desc: "有料のパックは準備中です。当面は、無料のぺったんと意匠パックを配布します。",
    },
    {
        icon: KeyRound,
        title: "DaiDaiのアカウントで使える",
        desc: "GoogleやAppleのアカウント、またはパスキーで、DaiDaiのアカウントのまま利用出来ます。",
    },
    {
        icon: Palette,
        title: "クリエイターが出品出来る",
        desc: "作ったぺったんを出品し、意匠パックを投稿出来ます。意匠パックは、審査の後に公開します。",
    },
];

const features = [
    {
        icon: Search,
        title: "探しやすい",
        desc: "検索やカテゴリで、気になるぺったんを絞り込めます。意匠パックは、名前や、対応する外観で絞り込めます。",
    },
    {
        icon: UserRound,
        title: "クリエイターが分かる",
        desc: "ぺったんごとに、作ったクリエイターの情報を見られます。",
    },
    {
        icon: Heart,
        title: "フォロー・お気に入り",
        desc: "気に入ったクリエイターのフォローや、ぺったんのお気に入り登録ができます。入手済み・フォロー中・お気に入りは、アカウントのページにまとまります。",
    },
    {
        icon: Sparkles,
        title: "メッセージに合わせた提案",
        desc: "ぺったんには役割を設定でき、DaiDaiでメッセージの内容に合わせて、使えそうなぺったんを提案出来ます。",
    },
];

const steps = [
    { no: "01", title: "探す", desc: "daidai横丁で、使ってみたいぺったんや意匠パックを探します。" },
    { no: "02", title: "入手する", desc: "DaiDaiのアカウントでログインして、入手します。" },
    { no: "03", title: "使う", desc: "DaiDaiのアプリで、入手したぺったんを使い、意匠パックで見た目を着せ替えます。" },
];

export default function DaidaiYokochoServicePage() {
    return (
        <div className="w-full text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8">「ぺったんと意匠が集まる、小さな横丁。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto mb-16">
                    DaiDaiで使えるぺったんと、DaiDaiの見た目を着せ替える意匠パックを、探して、入手出来るストア
                </p>

                {/* 目次 */}
                <div className="max-w-sm mx-auto text-left">
                    <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">CONTENTS</p>
                    <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
                        {contents.map((c) => (
                            <a
                                key={c.href}
                                href={c.href}
                                className="group flex items-center justify-between py-4 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 tracking-widest">
                                        {String(contents.indexOf(c) + 1).padStart(2, "0")}
                                    </span>
                                    {c.label}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-transform" strokeWidth={1.5} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3支柱ブロック */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pillars.map((p, i) => (
                        <div key={i} className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100 text-center">
                            <p.icon className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                            <h3 className="text-lg font-bold mb-3 text-balance">{p.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ぺったんとは */}
            <section id="about" className="container mx-auto px-6 py-20 max-w-5xl">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block text-center">ABOUT</span>
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-center text-gray-900">ぺったんと意匠パック</h2>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-2xl mx-auto mb-4 text-center">
                    ぺったんは、メッセージアプリDaiDaiで使えるスタンプです。daidai横丁では、色々なクリエイターのぺったんが並んでいます。
                </p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-2xl mx-auto mb-12 text-center">
                    意匠パックは、DaiDaiの色・形・背景を着せ替える、デザインの詰め合わせです。入手すると、DaiDaiの見た目が変わります。取得を外せば、標準の見た目に戻ります。公開の前に、Rhingが審査します。
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                            <f.icon className="w-6 h-6 mb-4 text-gray-700" strokeWidth={1.5} />
                            <h3 className="text-base font-bold mb-2 text-balance">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 使い方 */}
            <section id="howto" className="container mx-auto px-6 py-20 max-w-4xl">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block text-center">HOW TO</span>
                <h2 className="text-2xl font-bold mb-12 tracking-widest text-center text-gray-900">使い方</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {steps.map((s) => (
                        <div key={s.no} className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">{s.no}</p>
                            <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 還元率の算出の前提 */}
            <section id="fee" className="container mx-auto px-6 py-20 max-w-4xl scroll-mt-8">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block text-center">REVENUE SHARE</span>
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-center text-gray-900">還元率の算出の前提</h2>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-2xl mx-auto mb-10 text-center">
                    有料化した際の目標として、購入額の<strong className="font-bold text-gray-800">約91.4%</strong>を出品者に還元することを目指しています。これは概算で、保証するものではありません。当面は無料のぺったんと意匠パックのみで、還元はまだ発生していません。意匠パックの有料の配信は、別に定めます。
                </p>

                <div className="bg-white rounded-m3-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-widest">
                                <th className="p-5">項目</th>
                                <th className="p-5">割合（概算）</th>
                                <th className="p-5">備考</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {[
                                ["決済手数料（Stripe）", "3.6%", "ブラウザで直接購入する場合"],
                                ["daidai横丁の手数料", "5.0%", "サービスの維持費"],
                                ["出品者の取り分", "約91.4%", "100% − 3.6% − 5.0%。目標値で、保証するものではありません"],
                            ].map((row) => (
                                <tr key={row[0]} className="border-b last:border-0 border-gray-100 align-top">
                                    <td className="p-5 font-bold text-gray-800 whitespace-nowrap">{row[0]}</td>
                                    <td className="p-5 whitespace-nowrap">{row[1]}</td>
                                    <td className="p-5 leading-relaxed">{row[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold mb-3 text-gray-900">アプリ経由で購入する場合</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">
                            iOSやGoogle Playのアプリから購入する場合は、ストアに支払う手数料相当を、購入する人の価格に加算する方針です。出品者の取り分は、加算する前の元の価格を基準にします。尚、この仕組みは未実装で、ストア版のアプリも公開していません。
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold mb-3 text-gray-900">まだ決まっていないこと</h3>
                        <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
                            {[
                                "消費税の扱い（税込・税抜のどちらを基準にするか）",
                                "出品者への支払い方法（決済サービスの仕組みを含め、未定です）",
                                "支払いの時期と、最低支払額",
                                "返金が有った場合の、出品者の取り分の扱い",
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0 mt-2" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-6 text-center">
                    上の数字は、決済サービスの手数料率等をもとにした概算です。確定した内容は、有料化の前にあらためてお知らせします。
                </p>
            </section>

            {/* ストアへ */}
            <section className="container mx-auto px-6 pb-8 max-w-3xl">
                <div className="flex justify-center">
                    <CtaCard href="/daidai-yokocho" label="STORE" title="daidai横丁を見る" caption="ぺったんと意匠を探しに行く" />
                </div>
            </section>

            {/* リポジトリ */}
            <section id="github" className="container mx-auto px-6 pt-16 pb-8 max-w-5xl scroll-mt-8">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block text-center">REPOSITORY</span>
                <h2 className="text-2xl font-bold mb-4 tracking-widest text-center text-gray-900">仕組みを見る</h2>
                <p className="text-gray-600 leading-relaxed text-center max-w-xl mx-auto mb-10">
                    daidai横丁の画面は、このサイトのリポジトリに有ります。購入や出品の権限のルール、処理の部分は、DaiDaiのリポジトリに有ります。
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    {[
                        { href: "https://github.com/rhing-official/HomePage-Rhing", label: "GITHUB", title: "画面を見る", caption: "このサイトのリポジトリ" },
              { href: "https://gitdiagram.com/rhing-official/homepage-rhing", label: "DIAGRAM", title: "構成を図解する", caption: "GitDiagramでこのサイトの構成を見る" },
                        { href: "https://github.com/rhing-official/DaiDai", label: "GITHUB", title: "ルールと処理を見る", caption: "DaiDaiのリポジトリ" },
                    ].map((card) => (
                        <CtaCard key={card.href} href={card.href} label={card.label} title={card.title} caption={card.caption} />
                    ))}
                </div>
            </section>
        </div>
    );
}
