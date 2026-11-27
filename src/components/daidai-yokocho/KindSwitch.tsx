"use client";

import { motion } from "framer-motion";

export type CatalogKind = "petan" | "design";

const KIND_LABELS: Record<CatalogKind, string> = { petan: "ぺったん", design: "意匠" };

// ぺったん⇔意匠のスイッチ。つまみが左右に滑る。全体を押しても切り替わり、キーボードでも操作できる。
// 横丁のトップと、管理画面で使う。切り替えの中身（表示の切り替えか、ページの移動か）は、呼び出し側が決める
export default function KindSwitch({ value, onChange, className = "mb-8" }: { value: CatalogKind; onChange: (next: CatalogKind) => void; className?: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={value === "design"}
            aria-label="ぺったんと意匠を切り替える"
            onClick={() => onChange(value === "design" ? "petan" : "design")}
            className={`relative mx-auto flex h-12 w-64 items-center rounded-full bg-surface-container-lowest/70 border border-glass-edge/80 shadow-inner p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
        >
            <motion.span
                aria-hidden
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-blue-600 shadow"
                initial={false}
                animate={{ x: value === "design" ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
            {(Object.keys(KIND_LABELS) as CatalogKind[]).map((k) => (
                <span
                    key={k}
                    className={`relative z-10 flex-1 text-center text-sm font-bold tracking-wider transition-colors duration-200 ${
                        value === k ? "text-white" : "text-on-surface-subtle"
                    }`}
                >
                    {KIND_LABELS[k]}
                </span>
            ))}
        </button>
    );
}
