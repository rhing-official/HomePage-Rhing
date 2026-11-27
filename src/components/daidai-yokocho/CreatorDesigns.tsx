"use client";

import { useEffect, useState } from "react";
import type { CreatorProfile } from "@/lib/creatorProfiles";
import { listPublicThemePacksByCreator, type PublicThemePack } from "@/lib/themePackReview";
import DesignCard from "./DesignCard";

// クリエイターのページの、公開中の意匠
export default function CreatorDesigns({ creator }: { creator: CreatorProfile }) {
    const [packs, setPacks] = useState<PublicThemePack[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listPublicThemePacksByCreator(creator.userId)
            .then((list) => !cancelled && setPacks(list))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [creator.userId]);

    return (
        <>
            <h2 className="mb-6 text-lg font-bold text-on-surface">公開中の意匠</h2>
            {failed ? (
                <p className="text-sm text-red-600 dark:text-red-400">意匠を読み込めませんでした。</p>
            ) : packs === null ? (
                <p className="text-sm text-outline">読み込み中…</p>
            ) : packs.length === 0 ? (
                <p className="text-on-surface-subtle">公開している意匠は有りません</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packs.map((p) => (
                        <DesignCard key={p.id} pack={p} creator={creator} />
                    ))}
                </div>
            )}
        </>
    );
}
