import type { ComponentProps } from "react";

// glass: 半透明＋ぼかし（現行の見た目）／filled: 塗り（トーナル）／outlined: 枠線のみ
export type CardVariant = "glass" | "filled" | "outlined";
export type CardShape = "md" | "lg" | "xl";

const variants: Record<CardVariant, string> = {
    glass: "bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-1",
    filled: "bg-surface-container",
    outlined: "bg-white/60 border border-outline-variant",
};

const shapes: Record<CardShape, string> = {
    md: "rounded-m3-md",
    lg: "rounded-m3-lg",
    xl: "rounded-m3-xl",
};

// interactive: ホバーで持ち上げる（リンクカード用）
export default function Card({
    variant = "glass",
    shape = "lg",
    interactive = false,
    className = "",
    ...rest
}: ComponentProps<"div"> & { variant?: CardVariant; shape?: CardShape; interactive?: boolean }) {
    const hover = interactive
        ? "transition-all duration-300 ease-m3-standard hover:shadow-elevation-3 hover:bg-white/80"
        : "";
    return <div className={`${variants[variant]} ${shapes[shape]} ${hover} ${className}`.trim()} {...rest} />;
}
