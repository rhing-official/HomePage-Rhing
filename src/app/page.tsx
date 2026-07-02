"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// TypeScriptの型定義
interface ViewportCoords {
    top: number;
    left?: number;
    right?: number;
}

interface FloatingItem {
    mobile?: ViewportCoords;
    tabletPortrait?: ViewportCoords;
    tabletLandscape?: ViewportCoords;
    desktop?: ViewportCoords;
    width: string;
    delay: number;
    duration: number;
    rot: number;
    src: string;
}

// 🌟 ユーザー様が更新された最新の座標データ
const floatingItems: FloatingItem[] = [
    // ■ 左上エリア（5個）
    {
        mobile: { top: 10, left: 0 },
        tabletPortrait: { top: 10, left: 3 },
        tabletLandscape: { top: 3, left: 30 },
        desktop: { top: 8, left: 36 },
        width: "w-100", delay: 0.1, duration: 6, rot: 3, src: "/view/1.jpg"
    },
    {
        mobile: { top: 30, left: 2 },
        tabletPortrait: { top: 28, left: 4 },
        tabletLandscape: { top: 22, left: 10 },
        desktop: { top: 22, left: 18 },
        width: "w-40", delay: 0.3, duration: 8, rot: -5, src: "/view/2.jpg"
    },
    {
        mobile: { top: 4, left: 12 },
        tabletPortrait: { top: 5, left: 18 },
        tabletLandscape: { top: 5, left: 22 },
        desktop: { top: 5, left: 26 },
        width: "w-40", delay: 0.5, duration: 7, rot: 2, src: "/view/3.jpg"
    },
    {
        mobile: { top: 46, left: 0 },
        tabletPortrait: { top: 38, left: 2 },
        tabletLandscape: { top: 35, left: 4 },
        desktop: { top: 35, left: 8 },
        width: "w-36", delay: 0.2, duration: 6.5, rot: -8, src: "/view/4.jpg"
    },
    {
        tabletPortrait: { top: 50, left: 0 },
        tabletLandscape: { top: 48, left: 10 },
        desktop: { top: 48, left: 16 },
        width: "w-40", delay: 0.4, duration: 7.5, rot: 4, src: "/view/5.jpg"
    },

    // ■ 右上エリア（5個）
    {
        mobile: { top: 0, right: 0 },
        tabletPortrait: { top: 10, right: 15 },
        tabletLandscape: { top: 1, right: 6 },
        desktop: { top: 8, right: 16 },
        width: "w-50", delay: 0.2, duration: 6.2, rot: -4, src: "/view/6.jpg"
    },
    {
        mobile: { top: 46, right: 5 },
        tabletPortrait: { top: 15, right: 4 },
        tabletLandscape: { top: 7, right: 0 },
        desktop: { top: 22, right: 34 },
        width: "w-36", delay: 0.6, duration: 7.8, rot: 6, src: "/view/7.jpg"
    },
    {
        mobile: { top: 6, right: 20 },
        tabletPortrait: { top: 8, right: 34 },
        tabletLandscape: { top: 5, right: 22 },
        desktop: { top: 5, right: 26 },
        width: "w-50", delay: 0.1, duration: 6.9, rot: -12, src: "/view/8.jpg"
    },
    {
        tabletPortrait: { top: 35, right: 30 },
        tabletLandscape: { top: 35, right: 4 },
        desktop: { top: 35, right: 8 },
        width: "w-32", delay: 0.4, duration: 6.4, rot: 5, src: "/view/9.jpg"
    },
    {
        tabletPortrait: { top: 52, right: 4 },
        tabletLandscape: { top: 48, right: 6 },
        desktop: { top: 48, right: 16 },
        width: "w-40", delay: 0.3, duration: 7.1, rot: -6, src: "/view/10.jpg"
    },

    // ■ 左下エリア（5個）
    {
        mobile: { top: 53, left: 2 },
        tabletPortrait: { top: 64, left: 4 },
        tabletLandscape: { top: 64, left: 15 },
        desktop: { top: 64, left: 12 },
        width: "w-60", delay: 0.3, duration: 6.6, rot: 4, src: "/view/11.jpg"
    },
    {
        mobile: { top: 65, left: 0 },
        tabletPortrait: { top: 80, left: 30 },
        tabletLandscape: { top: 83, left: 14 },
        desktop: { top: 76, left: 20 },
        width: "w-36", delay: 0.5, duration: 7.2, rot: -3, src: "/view/12.jpg"
    },
    {
        tabletPortrait: { top: 90, left: 10 },
        tabletLandscape: { top: 80, left: 8 },
        desktop: { top: 86, left: 14 },
        width: "w-32", delay: 0.1, duration: 6.1, rot: 7, src: "/view/13.jpg"
    },
    {
        mobile: { top: 65, left: 35 },
        tabletPortrait: { top: 58, left: 8 },
        tabletLandscape: { top: 55, left: 28 },
        desktop: { top: 58, left: 40 },
        width: "w-36", delay: 0.4, duration: 7.4, rot: -5, src: "/view/14.jpg"
    },
    {
        tabletPortrait: { top: 75, left: 18 },
        desktop: { top: 70, left: 30 },
        width: "w-36", delay: 0.2, duration: 6.8, rot: -3, src: "/view/15.jpg"
    },

    // ■ 右下エリア（4個）
    {
        mobile: { top: 29, right: 0 },
        tabletPortrait: { top: 34, right: 0 },
        tabletLandscape: { top: 76, right: 3 },
        desktop: { top: 68, right: 12 },
        width: "w-50", delay: 0.4, duration: 6.3, rot: 8, src: "/view/16.jpg"
    },
    {
        mobile: { top: 65, right: 4 },
        tabletPortrait: { top: 60, right: 8 },
        tabletLandscape: { top: 60, right: 30 },
        desktop: { top: 60, right: 30 },
        width: "w-100", delay: 0.2, duration: 7.6, rot: 3, src: "/view/17.jpg"
    },
    {
        mobile: { top: 70, right: 1 },
        tabletPortrait: { top: 80, right: 5 },
        tabletLandscape: { top: 70, right: 18 },
        desktop: { top: 80, right: 5 },
        width: "w-50", delay: 0.6, duration: 6.7, rot: -4, src: "/view/18.jpg"
    },
    {
        mobile: { top: 58, right: 4 },
        tabletPortrait: { top: 62, right: 8 },
        tabletLandscape: { top: 60, right: 3 },
        desktop: { top: 58, right: 22 },
        width: "w-40", delay: 0.1, duration: 7.3, rot: -7, src: "/view/19.jpg"
    },
];

// 導線カード用
const menuCards = [
    { title: "団体概要・理念", en: "ABOUT", href: "/about", desc: "Rhingの理念と組織について" },
    { title: "サービス紹介", en: "SERVICES", href: "/services", desc: "アプリケーションなど" },
];

import { newsList } from "@/data/newsData";

export default function Home() {
    // 画面サイズ・縦横比を検知するステータス
    const [viewport, setViewport] = useState<"mobile" | "tabletPortrait" | "tabletLandscape" | "desktop">("desktop");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 640) {
                setViewport("mobile");
            } else if (height > width) {
                setViewport("tabletPortrait");
            } else if (width < 1200) {
                setViewport("tabletLandscape");
            } else {
                setViewport("desktop");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const currentViewport = isMounted ? viewport : "desktop";

    return (
        <div className="w-full">
            {/* ヒーローエリア */}
            {/* 🌟 修正ポイント1: 縦幅を h-[75vh] から少し余裕のある h-[80vh] へ拡大 */}
            <section className="h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">

                {/* 20個の反重力フローティングガラスカードをマッピングで描画 */}
                {floatingItems.map((item, index) => {
                    const imageIndex = (index % 20) + 1;
                    const imageSrc = `/view/${imageIndex}.jpg`;

                    const coords = item[currentViewport];

                    // 座標（coords）が定義されていない場合はレンダリングをスキップ（自動的に完璧な非表示）
                    if (!coords) return null;

                    const leftVal = coords.left;
                    const rightVal = coords.right;
                    const topVal = coords.top;

                    // 飛散距離の計算
                    const initialX = leftVal !== undefined ? `${50 - leftVal}vw` : `${rightVal !== undefined ? rightVal - 50 : 0}vw`;
                    // 🌟 修正ポイント2: 親コンテナの高さが 80vh に拡大したため、
                    // 中心点を 37.5 ➡️ 40vh、倍率を 0.75 ➡️ 0.8 に補正し、アニメーションの飛び出す中心を完全に揃えます
                    const initialY = `${40 - topVal * 0.8}vh`;

                    return (
                        <motion.div
                            key={index}
                            initial={{
                                opacity: 0,
                                scale: 0.1,
                                y: 30,
                                x: initialX,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                x: 0,
                                y: 0
                            }}
                            transition={{
                                duration: 1.5,
                                delay: item.delay,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="absolute z-10 pointer-events-none scale-55 sm:scale-80 lg:scale-100"
                            style={{
                                top: `${topVal}%`,
                                left: leftVal !== undefined ? `${leftVal}%` : undefined,
                                right: rightVal !== undefined ? `${rightVal}%` : undefined,
                            }}
                        >
                            {/* 内側で永続的な浮遊（反重力）を実行。傾き（rot）や周期も各々異なります */}
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [item.rot, item.rot + 1.5, item.rot] }}
                                transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                                className={`${item.width} h-auto bg-white/40 backdrop-blur-md border border-white/80 p-1 md:p-1.5 rounded-xl shadow-lg shadow-gray-200/20 flex items-center justify-center`}
                            >
                                <img
                                    src={imageSrc}
                                    alt={`Hero Floating ${index}`}
                                    className="w-full h-auto rounded-lg object-contain"
                                />
                            </motion.div>
                        </motion.div>
                    );
                })}

                {/* 中央のテキストエリア */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-center z-20"
                >
                    <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-widest text-[#111] leading-relaxed">
                        守る、繋ぐ、<br className="block sm:hidden" />自由であれ。
                    </h1>
                </motion.div>
            </section>

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