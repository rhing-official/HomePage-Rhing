"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // スクロール量を監視して、ボタンの表示・非表示を切り替える
    useEffect(() => {
        const toggleVisibility = () => {
            // ドロワーを開いて、ページを傾けている間は、スクロール位置を固定して出し入れする（Header.tsx）。
            // その間の値は一時的なので、見ない。見ると、開閉のたびにボタンが出入りして、カクつく
            if (document.documentElement.dataset.recede) return;
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
            className={`absolute bottom-8 right-8 p-4 bg-on-surface text-surface rounded-full shadow-lg transition-all duration-300 hover:bg-on-surface-variant ${isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"
                }`}
            aria-label="ページトップへ戻る"
        >
            <ArrowUp className="w-6 h-6" />
        </button>
    );
}