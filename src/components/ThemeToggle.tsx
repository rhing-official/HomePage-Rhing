"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { setPreference, subscribeTheme } from "@/lib/theme";

/**
 * 表示のテーマの切り替え。押すと、ライトとダークが、その場で入れ替わる。
 * まだ選んでいない間は、OSの設定に従い（lib/theme.ts）、押した瞬間の表示が、このブラウザに保存される。
 * アイコンは、今の表示（OSの設定に従っている間も含む）に合わせる。
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
    const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
    const Icon = dark ? Moon : Sun;

    return (
        <button
            type="button"
            aria-label={dark ? "ライトに切り替える" : "ダークに切り替える"}
            title={dark ? "ライトに切り替える" : "ダークに切り替える"}
            onClick={() => setPreference(dark ? "light" : "dark")}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-primary-container/60 hover:text-primary transition-colors ${className}`}
        >
            <Icon className="h-5 w-5" aria-hidden />
        </button>
    );
}
