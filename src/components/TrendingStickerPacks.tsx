"use client";

import { useEffect, useState } from "react";
import StickerPackCard from "@/components/StickerPackCard";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import type { StickerPack } from "@/lib/stickerPacks";

// トップの「人気のぺったん」。daidai横丁のカタログと同じカード（StickerPackCard）で表示する
export default function TrendingStickerPacks({ packs }: { packs: StickerPack[] }) {
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile> | null>(null);

    useEffect(() => {
        getCreatorProfiles(packs.map((p) => p.creatorId)).then(setCreatorProfiles);
    }, [packs]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {packs.map((pack) => (
                <StickerPackCard
                    key={pack.id}
                    pack={pack}
                    creator={creatorProfiles ? (creatorProfiles.get(pack.creatorId) ?? null) : undefined}
                />
            ))}
        </div>
    );
}
