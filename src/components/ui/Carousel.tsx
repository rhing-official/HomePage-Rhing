"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 横に並べた項目を、ドラッグ・スワイプ・矢印で送るカルーセル（embla-carousel）。
// 一定の間隔で自動で送り、端まで来たら、最初へ戻ってループする。マウスを載せている間、指で触れている間、フォーカスが中に有る間、タブが隠れている間は、止める。
// 全ての項目が収まる幅では、送れないので、動かさず、矢印も出さない。項目の幅は、slideClassName（basis-*）で決める。
// Tailwind は、完成した文字列しか拾えないので、間隔は、決めた値の名前で選ぶ。
const GAPS = {
    "6": { track: "-ml-6", slide: "pl-6" },
    "10": { track: "-ml-10", slide: "pl-10" },
} as const;

const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant/60 bg-surface/80 text-on-surface shadow-elevation-3 backdrop-blur-md transition-opacity duration-300 ease-m3-standard hover:bg-surface-container-lowest/90 disabled:pointer-events-none disabled:opacity-0 md:flex";

export default function Carousel({
    children,
    slideClassName,
    gap = "6",
    label,
    autoplayMs = 5000,
}: {
    children: React.ReactNode[];
    slideClassName: string;
    gap?: keyof typeof GAPS;
    label: string;
    autoplayMs?: number;
}) {
    // 常に1枚ずつ送る（"auto" だと、端の近くで、1枚送りと複数枚送りが混ざる）
    // loop: 端から端へ、続けて送れる。項目が少なく、幅に収まる時は、embla が自動でループを切る
    const [viewportRef, api] = useEmblaCarousel({ align: "start", slidesToScroll: 1, loop: true });
    // 自動で送るのを止める理由。どれか1つでも立っている間は、送らない
    const hold = useRef({ hover: false, focus: false, touch: false });
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const update = useCallback(() => {
        if (!api) return;
        setCanPrev(api.canScrollPrev());
        setCanNext(api.canScrollNext());
    }, [api]);

    useEffect(() => {
        if (!api) return;
        // 初回の読み取りは、購読の登録と同じ流れで行う
        const id = window.requestAnimationFrame(update);
        api.on("select", update).on("reInit", update).on("resize", update);
        return () => {
            window.cancelAnimationFrame(id);
            api.off("select", update).off("reInit", update).off("resize", update);
        };
    }, [api, update]);

    useEffect(() => {
        if (!api) return;
        let timer: number | undefined;
        const stop = () => window.clearInterval(timer);
        const start = () => {
            stop();
            timer = window.setInterval(() => {
                const h = hold.current;
                if (h.hover || h.focus || h.touch || document.hidden) return;
                api.scrollNext();
            }, autoplayMs);
        };
        // 触れた後は、離してから、間隔を数え直す。矢印で送った時も、数え直す
        const onDown = () => {
            hold.current.touch = true;
        };
        const onUp = () => {
            hold.current.touch = false;
            start();
        };
        start();
        api.on("pointerDown", onDown).on("pointerUp", onUp).on("select", start);
        return () => {
            stop();
            api.off("pointerDown", onDown).off("pointerUp", onUp).off("select", start);
        };
    }, [api, autoplayMs]);

    const g = GAPS[gap];
    const showArrows = canPrev || canNext;

    return (
        <div
            data-no-drawer-swipe
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            className="relative"
            onMouseEnter={() => (hold.current.hover = true)}
            onMouseLeave={() => (hold.current.hover = false)}
            onFocus={() => (hold.current.focus = true)}
            onBlur={() => (hold.current.focus = false)}
        >
            {/* 影が欠けないよう、上下に余白を取って、同じ量だけ打ち消す */}
            <div ref={viewportRef} onDragStart={(e) => e.preventDefault()} className="-my-4 overflow-hidden py-4">
                <div className={`flex ${g.track}`}>
                    {children.map((child, i) => (
                        <div key={i} role="group" aria-roledescription="slide" className={`min-w-0 shrink-0 grow-0 ${g.slide} ${slideClassName}`}>
                            {child}
                        </div>
                    ))}
                </div>
            </div>
            {showArrows && (
                <>
                    <button type="button" aria-label="前へ" disabled={!canPrev} onClick={() => api?.scrollPrev()} className={`${arrowClass} left-2`}>
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button type="button" aria-label="次へ" disabled={!canNext} onClick={() => api?.scrollNext()} className={`${arrowClass} right-2`}>
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}
        </div>
    );
}
