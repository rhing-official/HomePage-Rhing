import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroFloatingSection from "@/components/HeroFloatingSection";
import { newsList } from "@/data/newsData";
import { getTrendingStickerPacks, formatPackPrice } from "@/lib/stickerPacks";

export const dynamic = "force-dynamic";

// 導線カード用
const menuCards = [
    { title: "団体概要・理念", en: "ABOUT", href: "/about", desc: "Rhingの理念と組織について" },
    { title: "サービス紹介", en: "SERVICES", href: "/services", desc: "アプリケーションなど" },
];

export default async function Home() {
    const trendingPacks = await getTrendingStickerPacks(5);

    return (
        <div className="w-full">
            {/* ヒーローエリア */}
            <HeroFloatingSection />

            {/* 導線エリア*/}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {menuCards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group block h-64 bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                                        {card.en}
                                    </h2>
                                    <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                        {card.title}
                                    </p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                        {card.desc}
                                    </span>
                                    <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* daidai横丁：売れ筋ペタピタ */}
            {trendingPacks.length > 0 && (
                <section className="container mx-auto px-4 py-24 max-w-7xl">
                    <div className="flex flex-col items-center mb-16">
                        <p className="text-sm font-bold text-gray-400 tracking-[0.2em] mb-2 uppercase">DAIDAI YOKOCHO</p>
                        <h2 className="text-3xl font-bold tracking-widest text-gray-900 mb-8">daidai横丁で人気のペタピタ</h2>

                        <Link
                            href="/daidai-yokocho"
                            className="px-6 py-2.5 bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 rounded-full text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-white/90 hover:shadow-md hover:shadow-blue-300/15 transition-all duration-300"
                        >
                            すべて見る →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {trendingPacks.map((pack) => (
                            <Link
                                href={`/daidai-yokocho/${pack.id}`}
                                key={pack.id}
                                className="group flex flex-col h-full bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-xl"
                            >
                                <div className="relative w-full aspect-square bg-gray-100/60 flex items-center justify-center overflow-hidden">
                                    {pack.stickers[0]?.imageUrl ? (
                                        <img
                                            src={pack.stickers[0].imageUrl}
                                            alt={pack.name}
                                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="text-gray-300 text-xs">No Image</span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col gap-1">
                                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                        {pack.name}
                                    </h3>
                                    <span className={`text-xs font-bold ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                        {formatPackPrice(pack.price)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="container mx-auto px-4 py-24 max-w-7xl">
                {/* 見出しと「すべてのニュース」ボタン */}
                <div className="flex flex-col items-center mb-16">
                    <p className="text-sm font-bold text-gray-400 tracking-[0.2em] mb-2 uppercase">NEWS</p>
                    <h2 className="text-3xl font-bold tracking-widest text-gray-900 mb-8">最新情報</h2>

                    <a
                        href="https://note.com/rhing_official/all"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 rounded-full text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-white/90 hover:shadow-md hover:shadow-blue-300/15 transition-all duration-300"
                    >
                        すべてのニュース →
                    </a>
                </div>

                {/* グリッドレイアウト（6つまで表示） */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {newsList.slice(0, 6).map((news) => (
                        <a
                            href={news.url}
                            key={news.id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col h-full bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-xl"
                        >
                            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100/50">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow space-y-4">
                                <div className="flex justify-between items-center">
                                    <time className="text-[10px] font-bold text-gray-400 tracking-wider">{news.date}</time>
                                    <span className="text-[9px] font-bold bg-gray-50/80 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider border border-gray-200/50">
                                        {news.category}
                                    </span>
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                    {news.title}
                                </h2>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                                    {news.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
