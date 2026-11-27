import { Suspense } from "react";
import HeroFloatingSection from "@/components/HeroFloatingSection";
import { newsList } from "@/data/newsData";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CtaCard from "@/components/ui/CtaCard";
import TrendingStickerPacks from "@/components/TrendingStickerPacks";
import CartProvider from "@/components/CartProvider";
import { getTrendingStickerPacks } from "@/lib/stickerPacks";
import { getTrendingThemePacks } from "@/lib/trendingThemePacks";
import { pickTrendingSlots } from "@/lib/trendingSlots";
import { PackGridSkeleton } from "@/components/Skeleton";

export const dynamic = "force-dynamic";

// 導線カード用
const menuCards = [
    { title: "団体概要・理念", en: "ABOUT", href: "/about", desc: "理念と組織について" },
    { title: "サービス紹介", en: "SERVICES", href: "/services", desc: "アプリケーション等" },
    { title: "寄付・支援", en: "DONATE", href: "/donate", desc: "活動を支援する" },
    { title: "収支報告", en: "FINANCIAL", href: "/financial", desc: "収支を閲覧する" },
];

// 「人気のぺったんと意匠」の見出し（取得中の枠と、取得後で共通）
function TrendingHeader() {
    return (
        <div className="flex flex-col items-center mb-16">
            <p className="text-sm font-bold text-outline tracking-[0.2em] mb-2 uppercase">DAIDAI YOKOCHO</p>
            <h2 className="text-3xl font-bold tracking-widest text-on-surface mb-8">daidai横丁で人気のぺったんと意匠</h2>

            <Button href="/daidai-yokocho" variant="glass">
                全て見る →
            </Button>
        </div>
    );
}

// 人気のぺったんと意匠の取得（Firestore）を待つ間も、ページの他の部分を先に出せるよう、
// この部分だけを非同期にして、<Suspense>で包む（ストリーミング）
async function TrendingSection() {
    // 5枠のうち、意匠に2枠。意匠が足りない間は、ぺったんで埋める
    const [trendingPetan, trendingDesigns] = await Promise.all([getTrendingStickerPacks(5), getTrendingThemePacks(2)]);
    const { petan: trendingPacks, designs } = pickTrendingSlots(trendingPetan, trendingDesigns);
    if (trendingPacks.length === 0 && designs.length === 0) return null;
    return (
        <section className="container mx-auto px-4 py-24 max-w-screen-2xl">
            <TrendingHeader />
            <CartProvider>
                <TrendingStickerPacks packs={trendingPacks} designs={designs} />
            </CartProvider>
        </section>
    );
}

export default function Home() {
    return (
        <div className="w-full">
            {/* ヒーローエリア */}
            <HeroFloatingSection />

            {/* 導線エリア*/}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {menuCards.map((card) => (
                        <CtaCard key={card.href} href={card.href} label={card.en} title={card.title} caption={card.desc} heading="h2" />
                    ))}
                </div>
            </section>

            {/* daidai横丁：売れ筋のぺったんと、人気の意匠（取得中は、枠だけを先に出す） */}
            <Suspense
                fallback={
                    <section className="container mx-auto px-4 py-24 max-w-screen-2xl">
                        <TrendingHeader />
                        <PackGridSkeleton count={5} wide />
                    </section>
                }
            >
                <TrendingSection />
            </Suspense>

            <section className="container mx-auto px-4 py-24 max-w-screen-2xl">
                {/* 見出しと「全てのニュース」ボタン */}
                <div className="flex flex-col items-center mb-16">
                    <p className="text-sm font-bold text-outline tracking-[0.2em] mb-2 uppercase">NEWS</p>
                    <h2 className="text-3xl font-bold tracking-widest text-on-surface mb-8">最新情報</h2>

                    <Button href="https://note.com/rhing_official/all" variant="glass">
                        全てのニュース →
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
                            className="group flex flex-col h-full bg-surface-container-lowest/50 backdrop-blur-md border border-glass-edge/70 shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 ease-m3-standard overflow-hidden rounded-m3-md"
                        >
                            <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-container-high/50">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow space-y-4">
                                <div className="flex justify-between items-center">
                                    <time className="text-xs font-bold text-outline tracking-wider">{news.date}</time>
                                    <Badge>{news.category}</Badge>
                                </div>
                                <h2 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                                    {news.title}
                                </h2>
                                <p className="text-sm text-on-surface-subtle leading-relaxed line-clamp-3">
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
