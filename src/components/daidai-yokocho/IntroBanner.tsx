"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, onAuthStateChanged } from "@/lib/firebaseAuth";

const DISMISSED_KEY = "daidaiYokochoIntroDismissed";

// ログインしていない初めての訪問者向けの案内バー。閉じたらlocalStorageに記録し、
// 二度と表示しない（アカウントや追跡は使わない）。
export default function IntroBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let dismissed = false;
        try {
            dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
        } catch {
            // localStorageが使えない環境では、毎回表示する
        }
        if (dismissed) return;
        return onAuthStateChanged(auth, (user) => {
            setVisible(!user);
        });
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(DISMISSED_KEY, "1");
        } catch {
            // 保存できなくても、このページ内では閉じたままにする
        }
    };

    if (!visible) return null;

    return (
        <div className="container mx-auto px-6 mb-12 max-w-4xl">
            <div className="flex items-center justify-between gap-4 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl px-6 py-4 text-sm text-gray-700">
                <p className="leading-relaxed">
                    初めての方へ — ぺったんは、DaiDaiで使えるスタンプです。
                    <Link href="/services/daidai-yokocho" className="ml-2 underline underline-offset-4 hover:text-gray-900 transition-colors">
                        daidai横丁とは？
                    </Link>
                </p>
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="閉じる"
                    className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
