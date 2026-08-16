import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStickerPacksByCreator } from "@/lib/stickerPacks";
import { getCreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";
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
    const name = creator.nickname ?? creator.rhingId;
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
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl overflow-hidden p-8 md:p-12 mb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {creator.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={creator.iconUrl}
                                alt=""
                                className="w-24 h-24 rounded-full object-cover border border-white/80 shrink-0"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {creator.nickname ?? creator.rhingId}
                            </h1>
                            {creator.rhingId && (
                                <p className="text-sm text-gray-400 mt-1">@{creator.rhingId}</p>
                            )}
                            {creator.statusMessage && (
                                <p className="text-sm text-gray-600 mt-4">{creator.statusMessage}</p>
                            )}
                            {creator.snsLinkUrls.length > 0 && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                                    {creator.snsLinkUrls.map((url) => (
                                        <a
                                            key={url}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="text-xs text-blue-600 hover:text-blue-700 underline decoration-dotted break-all"
                                        >
                                            {url}
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6">
                                <FollowButton creatorId={creatorId} />
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-6">出品パック</h2>
                {packs.length === 0 ? (
                    <p className="text-gray-500">出品しているパックはありません</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packs.map((pack) => (
                            <StickerPackCard key={pack.id} pack={pack} creator={creator} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
