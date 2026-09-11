"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const exhibits = [
    {
        src: "/museum/night-alley.jpg",
        title: "《夜の回廊》",
        caption: "灯りの続く夜の路地",
    },
    {
        src: "/museum/vintage-chairs.jpg",
        title: "《色彩の椅子》",
        caption: "庭先に並ぶ五つの椅子",
    },
    {
        src: "/museum/rose-and-monument.jpg",
        title: "《薔薇と記念碑》",
        caption: "曇天の広場にて",
    },
    {
        src: "/museum/snow-town.jpg",
        title: "《雪の町、山影》",
        caption: "夕陽に染まる町並み",
    },
    {
        src: "/museum/berries-in-shade.jpg",
        title: "《木陰の実り》",
        caption: "葉隠れの青い実",
    },
    {
        src: "/museum/leaves-in-dark.jpg",
        title: "《葉陰の彩り》",
        caption: "闇に浮かぶ葉の群れ",
    },
];

export default function NotFound() {
    return (
        <div className="w-full pb-32">
            <div className="container mx-auto px-6 pt-32 pb-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="mb-16 text-center py-10 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">404 MUSEUM</h1>
                    <p className="text-gray-500 tracking-wider text-sm">お探しの展示は見つかりませんでした</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                    className="mb-16 text-center bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 md:p-10"
                >
                    <p className="text-gray-600 leading-relaxed">
                        本日は「存在しないページ」特別展を開催しております。
                        <br />
                        あいにく、お探しの作品(ページ)は見当たりませんでした。
                        <br />
                        URLをご確認のうえ、常設展示からお探しください。
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {exhibits.map((item, index) => (
                        <motion.div
                            key={item.src}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 + index * 0.1 }}
                            className="bg-white/60 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-2xl p-3 md:p-4"
                        >
                            <div className="border border-gray-200 bg-white p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.src} alt={item.title} className="w-full h-56 object-cover" />
                            </div>
                            <div className="text-center mt-4 mb-1">
                                <p className="text-sm font-bold text-gray-800 tracking-wider">{item.title}</p>
                                <p className="text-xs text-gray-400 mt-1 tracking-wide">{item.caption}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
                    className="pt-16 flex flex-col sm:flex-row justify-center gap-4"
                >
                    <Link
                        href="/"
                        className="px-12 py-4 bg-[#111] hover:bg-gray-800 text-white font-bold rounded-full text-center transition-colors tracking-widest shadow-md"
                    >
                        トップページへ戻る
                    </Link>
                    <Link
                        href="/contact"
                        className="px-12 py-4 border border-gray-300 text-gray-600 hover:bg-white/60 font-bold rounded-full text-center transition-colors tracking-widest"
                    >
                        お問い合わせ
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
