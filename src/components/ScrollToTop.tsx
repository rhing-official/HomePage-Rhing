"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // スクロール量を監視して、ボタンの表示・非表示を切り替える
    useEffect(() => {
        const toggleVisibility = () => {
            // 下に300pxスクロールしたら表示
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // クリックされたら一番上へ滑らかに戻る
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 p-4 bg-gray-900 text-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                }`}
            aria-label="ページトップへ戻る"
        >
            <ArrowUp className="w-6 h-6" />
        </button>
    );
}