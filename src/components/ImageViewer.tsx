"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ViewerImage {
    url: string;
    name: string;
}

const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_THRESHOLD = 60;
const CLOSE_SWIPE_THRESHOLD = 100;

// 1枚の画像の、拡大・縮小・移動。ピンチ（2本指）・ダブルタップ・ホイール・ドラッグに対応。
// 画像が切り替わるとき（keyが変わるとき）は、状態がリセットされる。
function ZoomableImage({
    image,
    onSwipe,
    onBackdropTap,
}: {
    image: ViewerImage;
    onSwipe: (dir: -1 | 1) => void;
    onBackdropTap: () => void;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const gesture = useRef({ startDist: 0, startScale: 1, moved: 0, pinched: false, downOnImage: false, downAt: 0, lastTapAt: 0, startX: 0, startY: 0 });

    const clampPan = (scale: number, x: number, y: number) => {
        const img = imgRef.current;
        if (!img) return { x, y };
        const maxX = (img.clientWidth * (scale - 1)) / 2;
        const maxY = (img.clientHeight * (scale - 1)) / 2;
        return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
    };

    const zoomTo = (scale: number) => {
        const next = Math.max(1, Math.min(MAX_SCALE, scale));
        setView((v) => ({ scale: next, ...(next === 1 ? { x: 0, y: 0 } : clampPan(next, v.x, v.y)) }));
    };

    const dist = () => {
        const [a, b] = Array.from(pointers.current.values());
        return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const g = gesture.current;
        if (pointers.current.size === 1) {
            g.moved = 0;
            g.pinched = false;
            g.downOnImage = e.target === imgRef.current;
            g.downAt = Date.now();
            g.startX = e.clientX;
            g.startY = e.clientY;
        } else if (pointers.current.size === 2) {
            g.startDist = dist();
            g.startScale = view.scale;
            g.pinched = true;
        }
        setDragging(true);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const prev = pointers.current.get(e.pointerId);
        if (!prev) return;
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const g = gesture.current;
        g.moved += Math.abs(dx) + Math.abs(dy);

        if (pointers.current.size >= 2) {
            const next = Math.max(1, Math.min(MAX_SCALE, g.startScale * (dist() / g.startDist)));
            setView((v) => ({ scale: next, ...(next === 1 ? { x: 0, y: 0 } : clampPan(next, v.x, v.y)) }));
        } else if (view.scale > 1) {
            setView((v) => ({ ...v, ...clampPan(v.scale, v.x + dx, v.y + dy) }));
        } else {
            // 拡大していないときの、下方向のスワイプ。指に追従させる（離したとき、一定以上なら閉じる）
            const totalDx = e.clientX - g.startX;
            const totalDy = e.clientY - g.startY;
            if (totalDy > 0 && totalDy > Math.abs(totalDx)) setView((v) => ({ ...v, y: totalDy }));
        }
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!pointers.current.has(e.pointerId)) return;
        pointers.current.delete(e.pointerId);
        const g = gesture.current;
        if (pointers.current.size > 0) return;
        setDragging(false);

        const totalDx = e.clientX - g.startX;
        const totalDy = e.clientY - g.startY;
        const moved = g.moved < 8;

        // 画像の外側を押して、動かさずに離したら閉じる（押している時間は問わない）
        if (moved && !g.downOnImage) {
            onBackdropTap();
            return;
        }
        if (moved && Date.now() - g.downAt < 300) {
            const now = Date.now();
            if (now - g.lastTapAt < 300) {
                g.lastTapAt = 0;
                zoomTo(view.scale > 1 ? 1 : DOUBLE_TAP_SCALE);
            } else {
                g.lastTapAt = now;
            }
            return;
        }
        // 拡大していないときの下スワイプで閉じる。足りなければ、元の位置に戻す
        if (view.scale === 1 && !g.pinched) {
            if (totalDy > CLOSE_SWIPE_THRESHOLD && totalDy > Math.abs(totalDx)) {
                onBackdropTap();
                return;
            }
            if (view.y !== 0) setView((v) => ({ ...v, y: 0 }));
        }
        // 拡大していないときの横スワイプで、前後の画像へ
        if (view.scale === 1 && !g.pinched && Math.abs(totalDx) > SWIPE_THRESHOLD && Math.abs(totalDx) > Math.abs(totalDy)) {
            onSwipe(totalDx < 0 ? 1 : -1);
        }
    };

    const onWheel = (e: React.WheelEvent) => {
        zoomTo(view.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    };

    return (
        <div
            className="absolute inset-0 flex items-center justify-center touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={image.url}
                alt={image.name}
                draggable={false}
                className="max-w-[94vw] max-h-[82vh] object-contain"
                style={{
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                    transition: dragging ? "none" : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
                    cursor: view.scale > 1 ? "grab" : "zoom-in",
                }}
            />
        </div>
    );
}

// 画像の全画面ビューア。拡大・移動、左右のスワイプ（PCは矢印キー・ボタン）で前後の画像へ。×・画像の外側のタップ・下スワイプ・Escで閉じる
export default function ImageViewer({
    images,
    index,
    onIndexChange,
    onClose,
}: {
    images: ViewerImage[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}) {
    const go = (dir: -1 | 1) => {
        const next = index + dir;
        if (next >= 0 && next < images.length) onIndexChange(next);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
            else if (e.key === "ArrowRight" && index < images.length - 1) onIndexChange(index + 1);
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [index, images.length, onClose, onIndexChange]);

    const current = images[index];
    if (!current) return null;

    const navButton = "absolute top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 shadow-elevation-2 text-gray-700 hover:bg-white transition disabled:hidden";

    return createPortal(
        // 開くとき・閉じるときに、ぼかしながら、ふわっと現れる・消える（PackGalleryのAnimatePresenceが閉じる動きを待つ）
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="画像の拡大表示"
            initial={{ opacity: 0, filter: "blur(14px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-[120] bg-[#fcfbf7]/97 backdrop-blur-sm"
        >
            <ZoomableImage key={index} image={current} onSwipe={go} onBackdropTap={onClose} />

            <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/80 shadow-elevation-2 text-gray-700 hover:bg-white transition"
            >
                <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
                <>
                    <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="前の画像" className={`${navButton} left-3 hidden md:block`}>
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button type="button" onClick={() => go(1)} disabled={index === images.length - 1} aria-label="次の画像" className={`${navButton} right-3 hidden md:block`}>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <p className="absolute bottom-6 inset-x-0 text-center text-sm text-gray-600 pointer-events-none">
                        {index + 1} / {images.length}
                    </p>
                </>
            )}
        </motion.div>,
        document.body,
    );
}
