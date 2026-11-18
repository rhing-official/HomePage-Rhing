"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ImageViewer, { type ViewerImage } from "@/components/ImageViewer";

// スクリーンショットの拡大表示。daidai横丁の商品画像（PackGallery）と同じ、全画面のImageViewerを使う。
// ページ内の画像を、並び順のまま1つの組にして、左右のスワイプ・矢印キーで前後の画像へ送れる。
type Ctx = { open: (src: string) => void };

const ScreenshotViewerContext = createContext<Ctx | null>(null);

export function useScreenshotViewer() {
    return useContext(ScreenshotViewerContext);
}

export default function ScreenshotViewerProvider({ images, children }: { images: ViewerImage[]; children: React.ReactNode }) {
    // null: 閉じている。数値: 開いている画像の番号
    const [index, setIndex] = useState<number | null>(null);
    const open = useCallback(
        (src: string) => {
            const i = images.findIndex((img) => img.url === src);
            if (i >= 0) setIndex(i);
        },
        [images],
    );
    const close = useCallback(() => setIndex(null), []);
    const value = useMemo(() => ({ open }), [open]);

    return (
        <ScreenshotViewerContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {index !== null && <ImageViewer images={images} index={index} onIndexChange={setIndex} onClose={close} />}
            </AnimatePresence>
        </ScreenshotViewerContext.Provider>
    );
}
