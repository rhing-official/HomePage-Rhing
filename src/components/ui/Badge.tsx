import type { ComponentProps } from "react";

export type BadgeTone = "neutral" | "primary" | "tertiary";

const tones: Record<BadgeTone, string> = {
    neutral: "bg-primary-container text-on-primary-container",
    primary: "bg-primary-container text-on-primary-container",
    tertiary: "bg-tertiary/10 text-tertiary",
};

export default function Badge({
    tone = "neutral",
    className = "",
    ...rest
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${tones[tone]} ${className}`.trim()}
            {...rest}
        />
    );
}
