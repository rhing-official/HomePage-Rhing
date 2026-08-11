"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

// ユーザー様が更新された最新の座標データ
const floatingItems: FloatingItem[] = [
    // ■ 左上エリア（5個）
    {
        mobile: { top: 10, left: 0 },
        tabletPortrait: { top: 10, left: 3 },
        tabletLandscape: { top: 1, left: 30 },
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
        // mobileの記述がないため、スマホ（mobile）時は自動的に表示されません
        tabletPortrait: { top: 50, left: 0 },
        tabletLandscape: { top: 55, left: 10 },
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
        width: "w-50", delay: 0.1, duration: 6.9, rot: -2, src: "/view/8.jpg"
    },
    {
        // mobileの記述がないため、スマホ（mobile）時は自動的に表示されません
        tabletPortrait: { top: 35, right: 30 },
        tabletLandscape: { top: 35, right: 4 },
        desktop: { top: 35, right: 8 },
        width: "w-32", delay: 0.4, duration: 6.4, rot: 5, src: "/view/9.jpg"
    },
    {
        // mobileの記述がないため、スマホ（mobile）時は自動的に表示されません
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
        // mobileの記述がないため、スマホ（mobile）時は自動的に表示されません
        tabletPortrait: { top: 90, left: 10 },
        tabletLandscape: { top: 80, left: 8 },
        desktop: { top: 86, left: 14 },
        width: "w-32", delay: 0.1, duration: 6.1, rot: 7, src: "/view/13.jpg"
    },
    {
        mobile: { top: 65, left: 35 },
        tabletPortrait: { top: 58, left: 8 },
        tabletLandscape: { top: 55, left: 28 },
        desktop: { top: 58, left: 44 },
        width: "w-36", delay: 0.4, duration: 7.4, rot: -5, src: "/view/14.jpg"
    },
    {
        // mobile と tabletLandscape の記述がないため、スマホとタブレット横表示のときは自動的に非表示になります！
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
        tabletLandscape: { top: 55, right: 30 },
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
        tabletLandscape: { top: 60, right: 7 },
        desktop: { top: 58, right: 22 },
        width: "w-40", delay: 0.1, duration: 7.3, rot: -7, src: "/view/19.jpg"
    },
];

export default function HeroFloatingSection() {
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
        <section className="h-[80vh] flex items-center justify-center px-6 relative overflow-hidden">

            {/* 20個の反重力フローティングガラスカードをマッピングで描画 */}
            {floatingItems.map((item, index) => {
                const imageIndex = (index % 20) + 1;
                const imageSrc = `/view/${imageIndex}.jpg`;

                const coords = item[currentViewport];

                // 🌟 修正ポイント3: 現在のデバイス用の座標（coords）が定義されていない場合は
                // このカードのレンダリング自体をスキップして、完全に非表示にします。
                if (!coords) return null;

                const leftVal = coords.left;
                const rightVal = coords.right;
                const topVal = coords.top;

                // 飛散距離の計算
                const initialX = leftVal !== undefined ? `${50 - leftVal}vw` : `${rightVal !== undefined ? rightVal - 50 : 0}vw`;
                const initialY = `${40 - topVal * 0.8}vh`;

                return (
                    <motion.div
                        key={index}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            y: 30,
                            x: initialX,
                            rotate: item.rot * 4,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0,
                            rotate: item.rot,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 85,
                            damping: 13,
                            mass: 0.9,
                            delay: item.delay,
                        }}
                        /*
                          🌟 修正ポイント4:
                          古い `item.showOnMobile` の複雑な条件分岐クラスをすべて削除しました。
                          単に各デバイスごとの大きさ（scale-55 / sm:scale-65 / xl:scale-100）を綺麗に指定するだけになり、バグが完全に解消されます。
                        */
                        className="absolute z-10 pointer-events-none scale-45 sm:scale-65 xl:scale-100"
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
    );
}
