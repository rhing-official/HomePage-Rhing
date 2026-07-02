"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 導線カード用
const menuCards = [
    { title: "団体概要・理念", en: "ABOUT", href: "/about", desc: "Rhingの理念と組織について" },
    { title: "サービス紹介", en: "SERVICES", href: "/services", desc: "アプリケーションなど" },
];

import { newsList } from "@/data/newsData";

export default function Home() {
    return (
        <div className="w-full">
            {/* ヒーローエリア*/}
            <section className="h-[70vh] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-center"
                >
                    <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-widest text-[#111] leading-relaxed">
                        守る、繋ぐ、自由であれ。
                    </h1>
                </motion.div>
            </section>

            {/* 導線エリア*/}
            <section className="container mx-auto px-4 py-16">
                {/* 2列に制限し、中央に美しく収まるようにしています */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {menuCards.map((card, index) => (
                        /* 
                          🌟 変更：ホバー時も完全にガラスデザイン（白磨りガラス）をキープします
                          - 通常時: bg-white/50 (半透明), backdrop-blur-md (ぼかし), border-white/80 (細い白境界線)
                          - ホバー時: hover:bg-white/80 (より明るい半透明ガラス), hover:shadow-blue-300/10 (淡いブルーのグロウ効果)
                        */
                        <Link
                            key={index}
                            href={card.href}
                            className="group block h-64 bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    {/* 英語タイトル：ホバー時にヘッダーと合わせたブルー（text-blue-600）に美しく変化します */}
                                    <h2 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                                        {card.en}
                                    </h2>
                                    <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                        {card.title}
                                    </p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                        {card.desc}
                                    </span>
                                    {/* 
                                      🌟 矢印ボタン：
                                      通常時は半透明（bg-white/40）、ホバー時にはアクセントのブルー（bg-blue-600）へと滑らかに変化します。
                                    */}
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

                    {/* 「すべてのニュース」ボタン */}
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
                        /* ニュースタイルカード（こちらも半透明の白ガラスデザインです） */
                        <a
                            href={news.url}
                            key={news.id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col h-full bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:bg-white/80 hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-xl"
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