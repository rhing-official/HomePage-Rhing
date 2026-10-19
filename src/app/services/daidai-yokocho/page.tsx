import { Metadata } from "next";
import Link from "next/link";
import { Gift, KeyRound, Palette, ArrowRight, Search, Heart, UserRound, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "daidai横丁 | Rhing",
    description: "DaiDaiで使えるぺったんのストア、daidai横丁について",
};

const contents = [
    { href: "#about", label: "ぺったんとは" },
    { href: "#howto", label: "使い方" },
    { href: "#creators", label: "クリエイターの方へ" },
];

const pillars = [
    {
        icon: Gift,
        title: "当面は無料",
        desc: "有料パックは準備中です。当面は、無料のぺったんを配布します。",
    },
    {
        icon: KeyRound,
        title: "DaiDaiのアカウントで使える",
        desc: "GoogleやAppleのアカウント、またはパスキーで、DaiDaiのアカウントのまま利用できます。",
    },
    {
        icon: Palette,
        title: "クリエイターが出品できる",
        desc: "作ったぺったんを、daidai横丁に出品できます。",
    },
];

const features = [
    {
        icon: Search,
        title: "探しやすい",
        desc: "検索やカテゴリで、気になるぺったんを絞り込めます。",
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
        desc: "ぺったんには役割を設定でき、DaiDaiでメッセージの内容に合わせて、使えそうなぺったんを提案できます。",
    },
];

const steps = [
    { no: "01", title: "探す", desc: "daidai横丁で、使ってみたいぺったんを探します。" },
    { no: "02", title: "入手する", desc: "DaiDaiのアカウントでログインして、入手します。" },
    { no: "03", title: "使う", desc: "DaiDaiのアプリで、入手したぺったんを使います。" },
];

export default function DaidaiYokochoServicePage() {
    return (
        <div className="w-full bg-[#fdfbf7] text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8">「ぺったんが集まる、小さな横丁。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto mb-16">
                    DaiDaiで使えるぺったんを、探して、入手できるストア
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
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
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
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-center text-gray-900">ぺったんとは</h2>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-2xl mx-auto mb-12 text-center">
                    ぺったんは、メッセージアプリDaiDaiで使えるスタンプです。daidai横丁では、いろいろなクリエイターのぺったんが並んでいます。
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
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
                        <div key={s.no} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">{s.no}</p>
                            <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* クリエイターの方へ */}
            <section id="creators" className="container mx-auto px-6 py-20 text-left max-w-3xl">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">FOR CREATORS</span>
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-gray-900">クリエイターの方へ</h2>
                <div className="space-y-2 text-gray-600 mb-8">
                    <p>作ったぺったんは、ログインして「作成と管理」のページから、daidai横丁に出品できます。</p>
                    <p>有料パックの出品は準備中です。当面は、無料のぺったんのみ出品できます。</p>
                    <p>
                        出品にあたってのルールは、
                        <Link href="/legal/creator" className="underline underline-offset-4 hover:text-gray-900 transition-colors">
                            クリエイター向けポリシー
                        </Link>
                        をご覧ください。
                    </p>
                </div>
            </section>

            {/* ストアへ */}
            <section className="container mx-auto px-6 pb-8 max-w-3xl">
                <Link
                    href="/daidai-yokocho"
                    className="group block h-64 w-full max-w-sm mx-auto bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                                STORE
                            </h3>
                            <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                daidai横丁を見る
                            </p>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                ぺったんを探しに行く
                            </span>
                            <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Link>
            </section>
        </div>
    );
}
