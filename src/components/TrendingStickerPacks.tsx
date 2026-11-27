"use client";

import { useEffect, useState } from "react";
import StickerPackCard from "@/components/StickerPackCard";
import DesignCard from "@/components/daidai-yokocho/DesignCard";
import KindBadge from "@/components/daidai-yokocho/KindBadge";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import type { StickerPack } from "@/lib/stickerPacks";
import type { PublicThemePack } from "@/lib/themePackReview";

// トップの「人気のぺったんと意匠」。daidai横丁のカタログと同じカード（ぺったんはStickerPackCard、意匠はDesignCard）で、
// ぺったんを先に、意匠を後に並べ、種別のバッジを付ける
export default function TrendingStickerPacks({ packs, designs = [] }: { packs: StickerPack[]; designs?: PublicThemePack[] }) {
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile> | null>(null);

    useEffect(() => {
        getCreatorProfiles([...packs.map((p) => p.creatorId), ...designs.map((d) => d.creatorId)]).then(setCreatorProfiles);
    }, [packs, designs]);

    const creatorOf = (id: string) => (creatorProfiles ? (creatorProfiles.get(id) ?? null) : undefined);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {packs.map((pack) => (
                <div key={`petan:${pack.id}`} className="relative">
                    <StickerPackCard pack={pack} creator={creatorOf(pack.creatorId)} />
                    <KindBadge kind="petan" className="pointer-events-none absolute left-3 top-3 z-10" />
                </div>
            ))}
            {designs.map((design) => (
                <div key={`design:${design.id}`} className="relative">
                    <DesignCard pack={design} creator={creatorOf(design.creatorId)} />
                    <KindBadge kind="design" className="pointer-events-none absolute left-3 top-3 z-10" />
                </div>
            ))}
        </div>
    );
}
