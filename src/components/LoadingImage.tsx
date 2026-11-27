"use client";

import { useState } from "react";

// 画像の読み込み前は、灰色のパルスを出し、読み込めたら、フェードインで表示する（2026-11-17）。
// 親は、大きさを決めた枠（relative など）にすること。この部品は、枠いっぱいに広がる。
// 読み込みに失敗したときは、パルスを止めて、何も出さない。
export default function LoadingImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
    return (
        <>
            {state === "loading" && <div aria-hidden="true" className="absolute inset-0 bg-outline-variant/60 animate-pulse" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                onLoad={() => setState("loaded")}
                onError={() => setState("error")}
                className={`${className} transition-opacity duration-300 ${state === "loaded" ? "opacity-100" : "opacity-0"}`}
            />
        </>
    );
}
