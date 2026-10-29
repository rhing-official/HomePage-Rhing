"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { getPackCover, type Sticker } from "@/lib/stickerPacks";
import ImageViewer from "@/components/ImageViewer";

// 商品画像のギャラリー。大きな画像1枚と、切り替え用のサムネイル
export default function PackGallery({
    stickers,
    coverStickerId = null,
    packName,
}: {
    stickers: Sticker[];
    coverStickerId?: string | null;
    packName: string;
}) {
    const [index, setIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    // パックの代表を最初に表示する（保存されている並びは変えない）
    const cover = getPackCover({ stickers, coverStickerId });
    const items = [...(cover ? [cover] : []), ...stickers.filter((s) => s !== cover)].filter((s) => s.imageUrl);
    if (items.length === 0) {
        return (
            <div className="aspect-square w-full rounded-m3-lg bg-white border border-gray-100 flex items-center justify-center text-gray-300 text-sm">
                No Image
            </div>
        );
    }
    const current = items[Math.min(index, items.length - 1)];

    return (
        <div className="flex flex-col gap-4">
            <button
                type="button"
                onClick={() => setViewerOpen(true)}
                aria-label="画像を全画面で表示"
                className="relative aspect-square w-full rounded-m3-lg bg-white border border-gray-100 shadow-elevation-1 flex items-center justify-center overflow-hidden cursor-zoom-in"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.imageUrl} alt={current.name || packName} className="w-full h-full object-contain p-6" />
                <span className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 shadow-elevation-1 text-gray-500" aria-hidden>
                    <Maximize2 className="w-4 h-4" />
                </span>
            </button>
            {items.length > 1 && (
                <ul className="grid grid-cols-5 sm:grid-cols-6 gap-2" aria-label="収録されているぺったん">
                    {items.map((sticker, i) => (
                        <li key={sticker.stickerId || i}>
                            <button
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={`${sticker.name || `${i + 1}枚目`}を表示`}
                                aria-current={i === index}
                                className={`aspect-square w-full rounded-m3-md bg-white overflow-hidden border-2 transition ${
                                    i === index ? "border-primary" : "border-gray-100 hover:border-outline"
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sticker.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <AnimatePresence>
                {viewerOpen && (
                    <ImageViewer
                        images={items.map((i) => ({ url: i.imageUrl, name: i.name || packName }))}
                        index={Math.min(index, items.length - 1)}
                        onIndexChange={setIndex}
                        onClose={() => setViewerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
