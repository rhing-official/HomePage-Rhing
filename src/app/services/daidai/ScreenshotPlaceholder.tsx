"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { useScreenshotViewer } from "./ScreenshotViewer";

type ScreenshotPlaceholderProps = {
    label: string;
    // video: 16:9（デスクトップ）／ portrait: 9:16 ／ phone: 実機の縦長（約9:20）／ photo: 小さめの画面の切り抜き（約4:3）
    aspect?: "video" | "portrait" | "phone" | "photo";
    // 画像が用意できたら、保存先（/screenshots/…）と代替テキストを渡す。無ければ破線のプレースホルダを出す
    src?: string;
    alt?: string;
    className?: string;
};

const aspectClasses = {
    video: "aspect-[16/9]",
    portrait: "aspect-[9/16]",
    phone: "aspect-[1220/2712]",
    photo: "aspect-[451/336]",
} as const;

const sizes = {
    video: "(min-width: 1024px) 50vw, 100vw",
    portrait: "(min-width: 1024px) 20vw, 50vw",
    phone: "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
    photo: "(min-width: 1024px) 451px, 100vw",
} as const;

export default function ScreenshotPlaceholder({ label, aspect = "video", src, alt, className = "" }: ScreenshotPlaceholderProps) {
    const aspectClass = aspectClasses[aspect];
    const viewer = useScreenshotViewer();

    if (src) {
        const image = <Image src={src} alt={alt ?? label} fill sizes={sizes[aspect]} className="object-cover" />;
        const frame = `relative ${aspectClass} w-full overflow-hidden rounded-m3-lg border border-outline-variant bg-black ${className}`;
        // 拡大表示が使える場所では、押すと全画面で開く（daidai横丁の商品画像と同じ作り）
        if (viewer) {
            return (
                <button type="button" onClick={() => viewer.open(src)} aria-label="画像を全画面で表示" className={`${frame} block cursor-zoom-in`}>
                    {image}
                    <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-surface-container-lowest/80 shadow-elevation-1 text-on-surface-subtle" aria-hidden>
                        <Maximize2 className="w-4 h-4" />
                    </span>
                </button>
            );
        }
        return <div className={frame}>{image}</div>;
    }

    return (
        <div
            className={`${aspectClass} w-full rounded-m3-lg border-2 border-dashed border-outline/50 bg-surface-container-high/60 flex items-center justify-center p-6 ${className}`}
        >
            <span className="text-outline text-sm text-center leading-relaxed tracking-wide">{label}</span>
        </div>
    );
}
