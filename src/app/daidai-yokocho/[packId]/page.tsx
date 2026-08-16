import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickerPackById, formatPackDate, formatPackPrice } from "@/lib/stickerPacks";
import { getCreatorProfile } from "@/lib/creatorProfiles";
import PurchaseButton from "@/components/PurchaseButton";
import FavoriteButton from "@/components/FavoriteButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ packId: string }>;
}): Promise<Metadata> {
    const { packId } = await params;
    const pack = await getStickerPackById(packId);
    if (!pack) {
        return { title: "パックが見つかりません | daidai横丁 | Rhing" };
    }
    return {
        title: `${pack.name} | daidai横丁 | Rhing`,
        description: `daidai横丁で頒布中のペタピタパック「${pack.name}」。`,
    };
}

export default async function StickerPackDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ packId: string }>;
    searchParams: Promise<{ purchase?: string }>;
}) {
    const { packId } = await params;
    const { purchase } = await searchParams;
    const pack = await getStickerPackById(packId);

    if (!pack) {
        notFound();
    }

    const creator = await getCreatorProfile(pack.creatorId);

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                {purchase === "success" && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-6 py-4 text-sm font-bold">
                        ご購入ありがとうございます。DaiDaiアプリでペタピタが使えるようになりました。
                    </div>
                )}
                {purchase === "cancel" && (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 px-6 py-4 text-sm">
                        購入がキャンセルされました。よろしければもう一度お試しください。
                    </div>
                )}
                <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl overflow-hidden p-8 md:p-12">
                    <div className="mb-10">
                        {pack.category && (
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">
                                {pack.category}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wider">{pack.name}</h1>

                        {creator && (
                            <Link
                                href={`/daidai-yokocho/creator/${pack.creatorId}`}
                                className="mt-4 flex items-center gap-2 w-fit group"
                            >
                                {creator.iconUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={creator.iconUrl}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover border border-white/80"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                                )}
                                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                                    {creator.nickname ?? creator.rhingId}
                                    {creator.rhingId && <span className="text-gray-400 ml-1">@{creator.rhingId}</span>}
                                </span>
                            </Link>
                        )}

                        {pack.createdAt && (
                            <p className="text-xs text-gray-400 mt-3">
                                公開日: {formatPackDate(pack.createdAt)}
                                {pack.updatedAt && pack.updatedAt !== pack.createdAt && (
                                    <>（最終更新: {formatPackDate(pack.updatedAt)}）</>
                                )}
                            </p>
                        )}

                        {pack.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {pack.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] text-gray-400 px-2 py-1">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-12">
                        {pack.stickers.map((sticker, i) => (
                            <div
                                key={sticker.stickerId || i}
                                className="aspect-square bg-white/60 border border-white/80 rounded-xl flex items-center justify-center overflow-hidden"
                            >
                                {sticker.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={sticker.imageUrl} alt={sticker.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-gray-300 text-xs">No Image</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-4">
                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <p className={`text-2xl font-bold ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                {formatPackPrice(pack.price)}
                            </p>
                            <PurchaseButton packId={pack.id} />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <FavoriteButton packId={pack.id} />
                            <button
                                disabled
                                className="text-sm text-gray-400 cursor-not-allowed underline decoration-dotted"
                                title="通報機能は近日公開予定です"
                            >
                                通報する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
