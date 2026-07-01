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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {menuCards.map((card, index) => (
                        <Link key={index} href={card.href} className="group block h-64 bg-[#f8f8f8] hover:bg-[#111] transition-colors duration-500 rounded-lg overflow-hidden relative p-8">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <h2 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {card.en}
                                    </h2>
                                    <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-white transition-colors">
                                        {card.title}
                                    </p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                        {card.desc}
                                    </span>
                                    {/* 矢印アイコンがホバーで右にスライド */}
                                    <div className="w-10 h-10 rounded-full border border-gray-300 group-hover:border-white flex items-center justify-center group-hover:bg-white text-gray-900 transition-all duration-300 transform group-hover:translate-x-2">
                                        <ArrowRight className="w-5 h-5 group-hover:text-black" />
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
                        className="px-6 py-2 border border-gray-300 rounded-full text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-all duration-300"
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
                            className="group flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow space-y-4">
                                <div className="flex justify-between items-center">
                                    <time className="text-[10px] font-bold text-gray-400 tracking-wider">{news.date}</time>
                                    <span className="text-[9px] font-bold bg-gray-50 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider border border-gray-200">
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