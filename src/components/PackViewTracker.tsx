"use client";

import { useEffect } from "react";
import { recordStickerPackView } from "@/lib/firebaseFunctions";
import { shouldRecordView } from "@/lib/packStats";

// 販売ページを開いたとき、この訪問で1回だけ、閲覧を記録する（何も表示しない）。
// 出品者にだけ見える閲覧回数のための記録。誰が見たかは保存せず、回数だけを足す。
export default function PackViewTracker({ packId }: { packId: string }) {
    useEffect(() => {
        if (!shouldRecordView(window.sessionStorage, packId)) return;
        recordStickerPackView({ packId }).catch(() => {
            // 記録に失敗しても、ページの表示には影響させない
        });
    }, [packId]);
    return null;
}
