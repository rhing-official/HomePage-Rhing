"use client";

import { useCallback, useState } from "react";

// 画像の読み込み前は、灰色のパルスを出し、読み込めたら、フェードインで表示する（2026-11-17）。
// 親は、大きさを決めた枠（relative など）にすること。この部品は、枠いっぱいに広がる。
// 読み込みに失敗したときは、パルスを止めて、何も出さない。
export default function LoadingImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
    // サーバーで描いた画像は、ハイドレーションの前に読み込みが終わることがある。その時は、onLoad・onError が付く前に
    // イベントが過ぎていて、パルスのまま止まる（リロードで直る）。マウント時と src が変わった時に、読み込み済みかを自分で見る
    const imgRef = useCallback(
        (img: HTMLImageElement | null) => {
            if (img?.complete) setState(img.naturalWidth > 0 ? "loaded" : "error");
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- src が変わった時に、参照を作り直して、再度確認させる為
        [src],
    );
    return (
        <>
            {state === "loading" && <div aria-hidden="true" className="absolute inset-0 bg-outline-variant/60 animate-pulse" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={() => setState("loaded")}
                onError={() => setState("error")}
                className={`${className} transition-opacity duration-300 ${state === "loaded" ? "opacity-100" : "opacity-0"}`}
            />
        </>
    );
}
