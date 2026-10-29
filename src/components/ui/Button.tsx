import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Material Design 3 のボタン種別。glass は、これまでの半透明のピルボタン
export type ButtonVariant = "filled" | "tonal" | "outlined" | "text" | "glass";

const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wider transition-all duration-300 ease-m3-standard disabled:opacity-40 disabled:pointer-events-none";

const sizes = {
    md: "px-6 py-2.5 text-sm",
    lg: "px-10 py-3 text-sm",
} as const;

const variants: Record<ButtonVariant, string> = {
    filled: "bg-primary text-on-primary hover:bg-primary/90 hover:shadow-elevation-2",
    tonal: "bg-primary-container text-on-primary-container hover:shadow-elevation-1 hover:brightness-95",
    outlined: "border border-outline text-primary hover:bg-primary/8",
    text: "text-primary hover:bg-primary/8",
    glass: "bg-white/70 backdrop-blur-sm border border-white/80 shadow-elevation-1 text-primary hover:text-primary hover:border-primary/30 hover:bg-white/90 hover:shadow-elevation-2",
};

type Common = {
    variant?: ButtonVariant;
    size?: keyof typeof sizes;
    className?: string;
    children: ReactNode;
};

export function buttonClass({ variant = "filled", size = "md", className = "" }: Omit<Common, "children">) {
    return `${base} ${sizes[size]} ${variants[variant]} ${className}`.trim();
}

// href があれば、内部リンクは Link、外部リンクは a で描画する。無ければ button
export default function Button(
    props: Common & ({ href: string } & Omit<ComponentProps<"a">, "href" | "className" | "children"> | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">)),
) {
    const { variant, size, className, children, ...rest } = props;
    const cls = buttonClass({ variant, size, className });

    if ("href" in rest && rest.href !== undefined) {
        const { href, ...anchor } = rest as { href: string } & ComponentProps<"a">;
        if (/^https?:\/\//.test(href)) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...anchor}>
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={cls} {...anchor}>
                {children}
            </Link>
        );
    }
    const { href: _unused, ...button } = rest as ComponentProps<"button"> & { href?: undefined };
    void _unused;
    return (
        <button type="button" className={cls} {...button}>
            {children}
        </button>
    );
}
