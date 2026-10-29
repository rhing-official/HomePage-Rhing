import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroFloatingSection from "@/components/HeroFloatingSection";
import { newsList } from "@/data/newsData";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getTrendingStickerPacks, formatPackPrice } from "@/lib/stickerPacks";

export const dynamic = "force-dynamic";

// 導線カード用
const menuCards = [
    { title: "団体概要・理念", en: "ABOUT", href: "/about", desc: "理念と組織について" },
    { title: "サービス紹介", en: "SERVICES", href: "/services", desc: "アプリケーションなど" },
    { title: "寄付・支援", en: "DONATE", href: "/donate", desc: "活動を支援する" },
    { title: "収支報告", en: "FINANCIAL", href: "/financial", desc: "収支を閲覧する" },
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
                            className="group block h-64 bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 hover:bg-white/80 hover:border-white hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard rounded-m3-lg overflow-hidden relative p-8"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-primary transition-colors">
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
                                    <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* daidai横丁：売れ筋ぺったん */}
            {trendingPacks.length > 0 && (
                <section className="container mx-auto px-4 py-24 max-w-7xl">
                    <div className="flex flex-col items-center mb-16">
                        <p className="text-sm font-bold text-gray-400 tracking-[0.2em] mb-2 uppercase">DAIDAI YOKOCHO</p>
                        <h2 className="text-3xl font-bold tracking-widest text-gray-900 mb-8">daidai横丁で人気のぺったん</h2>

                        <Button href="/daidai-yokocho" variant="glass">
                            すべて見る →
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {trendingPacks.map((pack) => (
                            <Link
                                href={`/daidai-yokocho/${pack.id}`}
                                key={pack.id}
                                className="group flex flex-col h-full bg-white border border-gray-100 shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard overflow-hidden rounded-m3-md"
                            >
                                <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
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
                                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
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

                    <Button href="https://note.com/rhing_official/all" variant="glass">
                        すべてのニュース →
                    </Button>
                </div>

                {/* グリッドレイアウト（6つまで表示） */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {newsList.slice(0, 6).map((news) => (
                        <a
                            href={news.url}
                            key={news.id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col h-full bg-white/50 backdrop-blur-md border border-white/70 shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard overflow-hidden rounded-m3-md"
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
                                    <Badge>{news.category}</Badge>
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
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
