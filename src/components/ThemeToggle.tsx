"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { getServerPreference, readPreference, setPreference, subscribeTheme, type ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
    { value: "system", label: "システムに合わせる", Icon: Monitor },
    { value: "light", label: "ライト", Icon: Sun },
    { value: "dark", label: "ダーク", Icon: Moon },
];

/** 表示のテーマの切り替え。押すと、3項目のメニューが開く。アイコンは、選んでいる状態に合わせる */
export default function ThemeToggle({ className = "", menuAlign = "right" }: { className?: string; menuAlign?: "left" | "right" }) {
    const pref = useSyncExternalStore(subscribeTheme, readPreference, getServerPreference);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const Current = OPTIONS.find((o) => o.value === pref)?.Icon ?? Monitor;

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                aria-label="表示のテーマを選ぶ"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface hover:bg-primary-container/60 hover:text-primary transition-colors"
            >
                <Current className="h-5 w-5" aria-hidden />
            </button>
            {open && (
                <div
                    role="menu"
                    className={`absolute top-full mt-2 z-[90] min-w-44 rounded-2xl border border-outline-variant bg-surface-container-lowest p-1 shadow-elevation-3 ${menuAlign === "right" ? "right-0" : "left-0"}`}
                >
                    {OPTIONS.map(({ value, label, Icon }) => (
                        <button
                            key={value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={pref === value}
                            onClick={() => {
                                setPreference(value);
                                setOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                                pref === value ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface hover:bg-primary-container/60"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
