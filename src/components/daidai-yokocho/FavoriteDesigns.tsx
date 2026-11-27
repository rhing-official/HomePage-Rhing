"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { getDesignListIds, loadDesignList, removeFromDesignList } from "@/lib/designLists";
import type { PublicThemePack } from "@/lib/themePackReview";
import { PackGridSkeleton } from "@/components/Skeleton";
import DesignCard from "./DesignCard";

// お気に入りの意匠（「お気に入り」の意匠の側）。存在しない・取り下げの意匠は、読み込みの時にお気に入りから消す。配信停止は、消さずに隠す
export default function FavoriteDesigns({ uid }: { uid: string }) {
    const [packs, setPacks] = useState<PublicThemePack[] | null>(null);
    const [creators, setCreators] = useState<Map<string, CreatorProfile>>(new Map());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const ids = await getDesignListIds(uid, "favoriteDesigns");
            const list = await loadDesignList(uid, "favoriteDesigns", ids);
            const profiles = await getCreatorProfiles(list.map((p) => p.creatorId)).catch(() => new Map<string, CreatorProfile>());
            if (cancelled) return;
            setPacks(list);
            setCreators(profiles);
        })().catch(() => !cancelled && setPacks([]));
        return () => {
            cancelled = true;
        };
    }, [uid]);

    if (packs === null) return <PackGridSkeleton count={3} />;
    if (packs.length === 0) {
        return (
            <p className="text-gray-400 text-sm">
                まだお気に入りの意匠が有りません。
                <Link href="/daidai-yokocho?kind=design" className="text-blue-600 hover:underline ml-1">
                    daidai横丁で探す →
                </Link>
            </p>
        );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {packs.map((pack) => (
                <div key={pack.id} className="flex flex-col gap-2">
                    <DesignCard pack={pack} creator={creators.get(pack.creatorId) ?? null} />
                    <button
                        type="button"
                        onClick={async () => {
                            await removeFromDesignList(uid, "favoriteDesigns", pack.id);
                            setPacks((prev) => (prev ?? []).filter((p) => p.id !== pack.id));
                        }}
                        className="self-start text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                        お気に入りから外す
                    </button>
                </div>
            ))}
        </div>
    );
}
