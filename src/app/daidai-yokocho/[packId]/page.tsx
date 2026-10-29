import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickerPackById, getStickerPacksByCreator, formatPackDate, formatPackPrice } from "@/lib/stickerPacks";
import { getCreatorProfile } from "@/lib/creatorProfiles";
import PurchaseButton from "@/components/PurchaseButton";
import FavoriteButton from "@/components/FavoriteButton";
import PackGallery from "@/components/PackGallery";
import StickerPackCard from "@/components/StickerPackCard";

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
        description: `daidai横丁で頒布中のぺったんパック「${pack.name}」。`,
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

    const [creator, creatorPacks] = await Promise.all([
        getCreatorProfile(pack.creatorId),
        getStickerPacksByCreator(pack.creatorId),
    ]);
    const otherPacks = creatorPacks.filter((p) => p.id !== pack.id).slice(0, 3);
    const priceClass = pack.price === 0 ? "text-emerald-600" : "text-amber-600";
    const favoriteSlot = (
        <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full border border-outline">
            <FavoriteButton packId={pack.id} />
        </span>
    );

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                {purchase === "success" && (
                    <div className="mb-6 rounded-m3-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-6 py-4 text-sm font-bold">
                        ご購入ありがとうございます。DaiDaiアプリでぺったんが使えるようになりました。
                    </div>
                )}
                {purchase === "cancel" && (
                    <div className="mb-6 rounded-m3-md border border-gray-200 bg-gray-50 text-gray-600 px-6 py-4 text-sm">
                        購入がキャンセルされました。よろしければもう一度お試しください。
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
                    {/* 左: 画像 */}
                    <PackGallery stickers={pack.stickers} packName={pack.name} />

                    {/* 右: 商品情報と購入（PCでは追従） */}
                    <div className="md:sticky md:top-28 flex flex-col gap-6">
                        <div>
                            {pack.category && (
                                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">{pack.category}</span>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wider">{pack.name}</h1>

                            {creator && (
                                <Link
                                    href={`/daidai-yokocho/creator/${pack.creatorId}`}
                                    className="mt-4 flex items-center gap-2 w-fit group"
                                >
                                    {creator.iconUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={creator.iconUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/80" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-200" />
                                    )}
                                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">
                                        {creator.nickname ?? (creator.rhingSeed && `@${creator.rhingSeed}`)}
                                    </span>
                                </Link>
                            )}
                        </div>

                        <p className={`text-4xl font-bold ${priceClass}`}>{formatPackPrice(pack.price)}</p>

                        {/* 購入パネル */}
                        <div>
                            <PurchaseButton packId={pack.id} extra={favoriteSlot} />
                        </div>

                        <ul className="text-xs text-gray-500 leading-relaxed list-disc pl-5 space-y-1">
                            <li>入手すると、DaiDaiアプリでこのぺったんが使えるようになります。</li>
                            <li>入手したぺったんは、「購入済みのぺったん」から確認できます。</li>
                        </ul>

                        {/* 商品情報 */}
                        <dl className="text-sm border-t border-gray-200">
                            <div className="flex gap-4 py-3 border-b border-gray-100">
                                <dt className="w-24 shrink-0 text-gray-500">収録数</dt>
                                <dd className="text-gray-800">{pack.stickers.length}枚</dd>
                            </div>
                            {pack.category && (
                                <div className="flex gap-4 py-3 border-b border-gray-100">
                                    <dt className="w-24 shrink-0 text-gray-500">カテゴリ</dt>
                                    <dd className="text-gray-800">{pack.category}</dd>
                                </div>
                            )}
                            {pack.createdAt && (
                                <div className="flex gap-4 py-3 border-b border-gray-100">
                                    <dt className="w-24 shrink-0 text-gray-500">公開日</dt>
                                    <dd className="text-gray-800">
                                        {formatPackDate(pack.createdAt)}
                                        {pack.updatedAt && pack.updatedAt !== pack.createdAt && (
                                            <span className="text-gray-400">（最終更新: {formatPackDate(pack.updatedAt)}）</span>
                                        )}
                                    </dd>
                                </div>
                            )}
                            {pack.tags.length > 0 && (
                                <div className="flex gap-4 py-3 border-b border-gray-100">
                                    <dt className="w-24 shrink-0 text-gray-500">タグ</dt>
                                    <dd className="text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                                        {pack.tags.map((tag) => (
                                            <span key={tag}>#{tag}</span>
                                        ))}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div>
                            <button
                                disabled
                                className="text-xs text-gray-400 cursor-not-allowed underline decoration-dotted"
                                title="通報機能は近日公開予定です"
                            >
                                このパックを通報する
                            </button>
                        </div>
                    </div>
                </div>

                {/* このクリエイターの、ほかのパック */}
                {otherPacks.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-lg font-bold text-gray-900 tracking-wider mb-6">このクリエイターの、ほかのぺったん</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherPacks.map((p) => (
                                <StickerPackCard key={p.id} pack={p} creator={creator} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

        </div>
    );
}
