import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStickerPacksByCreator } from "@/lib/stickerPacks";
import { getCreatorProfile } from "@/lib/creatorProfiles";
import CreatorPacks from "./CreatorPacks";
import SnsLinkList from "@/components/SnsLinkList";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ creatorId: string }>;
}): Promise<Metadata> {
    const { creatorId } = await params;
    const creator = await getCreatorProfile(creatorId);
    if (!creator) {
        return { title: "クリエイターが見つかりません | daidai横丁 | Rhing" };
    }
    const name = creator.nickname ?? creator.rhingSeed;
    return {
        title: `${name} | daidai横丁 | Rhing`,
        description: `daidai横丁で出品中のクリエイター「${name}」のプロフィール。`,
    };
}

export default async function CreatorProfilePage({
    params,
}: {
    params: Promise<{ creatorId: string }>;
}) {
    const { creatorId } = await params;
    const [creator, packs] = await Promise.all([
        getCreatorProfile(creatorId),
        getStickerPacksByCreator(creatorId),
    ]);

    if (!creator) {
        notFound();
    }

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-24 max-w-4xl">
                <div className="bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-md shadow-outline-variant/30 rounded-3xl overflow-hidden p-8 md:p-12 mb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {creator.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={creator.iconUrl}
                                alt=""
                                className="w-24 h-24 rounded-full object-cover border border-glass-edge/80 shrink-0"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-outline-variant shrink-0" />
                        )}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-on-surface">
                                {creator.nickname ?? (creator.rhingSeed && `@${creator.rhingSeed}`)}
                            </h1>
                            {creator.nickname && creator.rhingSeed && (
                                <p className="text-sm text-outline mt-1">@{creator.rhingSeed}</p>
                            )}
                            {creator.statusMessage && (
                                <p className="text-sm text-on-surface-variant mt-4">{creator.statusMessage}</p>
                            )}
                            <SnsLinkList urls={creator.snsLinkUrls} />
                            <div className="mt-6">
                                <FollowButton creatorId={creatorId} />
                            </div>
                        </div>
                    </div>
                </div>

                <CreatorPacks packs={packs} creator={creator} />
            </div>
        </div>
    );
}
