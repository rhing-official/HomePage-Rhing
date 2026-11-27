import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickerPackById, getStickerPacksByCreator, formatPackDate, formatPackPrice } from "@/lib/stickerPacks";
import { getCreatorProfile } from "@/lib/creatorProfiles";
import PurchaseButton from "@/components/PurchaseButton";
import FavoriteButton from "@/components/FavoriteButton";
import PackGallery from "@/components/PackGallery";
import PackViewTracker from "@/components/PackViewTracker";
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
        return { title: "ぺったんが見つかりません | daidai横丁 | Rhing" };
    }
    return {
        title: `${pack.name} | daidai横丁 | Rhing`,
        description: `daidai横丁で頒布中のぺったん「${pack.name}」。`,
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
    const priceClass = pack.price === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
    const favoriteSlot = (
        <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full border border-outline">
            <FavoriteButton packId={pack.id} />
        </span>
    );

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <PackViewTracker packId={pack.id} />

                {purchase === "success" && (
                    <div className="mb-6 rounded-m3-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 px-6 py-4 text-sm font-bold">
                        ご購入ありがとうございます。DaiDaiアプリでぺったんが使えるようになりました。
                    </div>
                )}
                {purchase === "cancel" && (
                    <div className="mb-6 rounded-m3-md border border-outline-variant bg-surface-container text-on-surface-variant px-6 py-4 text-sm">
                        購入がキャンセルされました。よろしければもう一度お試しください。
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
                    {/* 左: 画像 */}
                    <PackGallery stickers={pack.stickers} coverStickerId={pack.coverStickerId} packName={pack.name} />

                    {/* 右: 商品情報と購入（PCでは追従） */}
                    <div className="md:sticky md:top-28 flex flex-col gap-6">
                        <div>
                            {pack.category && (
                                <span className="text-xs font-bold tracking-widest text-on-surface-subtle mb-2 block">{pack.category}</span>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-wider">{pack.name}</h1>

                            {creator && (
                                <Link
                                    href={`/daidai-yokocho/creator/${pack.creatorId}`}
                                    className="mt-4 flex items-center gap-2 w-fit group"
                                >
                                    {creator.iconUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={creator.iconUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-glass-edge/80" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-outline-variant" />
                                    )}
                                    <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">
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

                        <ul className="text-xs text-on-surface-subtle leading-relaxed list-disc pl-5 space-y-1">
                            <li>入手すると、DaiDaiアプリでこのぺったんが使えるようになります。</li>
                            <li>入手したぺったんは、「購入済みのぺったん」から確認出来ます。</li>
                            {pack.price > 0 && <li>18歳未満の方は、保護者の同意を得てからご購入ください。</li>}
                        </ul>

                        {/* 商品情報 */}
                        <dl className="text-sm border-t border-outline-variant">
                            <div className="flex gap-4 py-3 border-b border-outline-variant">
                                <dt className="w-24 shrink-0 text-on-surface-subtle">収録数</dt>
                                <dd className="text-on-surface">{pack.stickers.length}枚</dd>
                            </div>
                            {pack.category && (
                                <div className="flex gap-4 py-3 border-b border-outline-variant">
                                    <dt className="w-24 shrink-0 text-on-surface-subtle">カテゴリ</dt>
                                    <dd className="text-on-surface">{pack.category}</dd>
                                </div>
                            )}
                            {pack.createdAt && (
                                <div className="flex gap-4 py-3 border-b border-outline-variant">
                                    <dt className="w-24 shrink-0 text-on-surface-subtle">公開日</dt>
                                    <dd className="text-on-surface">
                                        {formatPackDate(pack.createdAt)}
                                        {pack.updatedAt && pack.updatedAt !== pack.createdAt && (
                                            <span className="text-outline">（最終更新: {formatPackDate(pack.updatedAt)}）</span>
                                        )}
                                    </dd>
                                </div>
                            )}
                            {pack.tags.length > 0 && (
                                <div className="flex gap-4 py-3 border-b border-outline-variant">
                                    <dt className="w-24 shrink-0 text-on-surface-subtle">タグ</dt>
                                    <dd className="text-on-surface-variant flex flex-wrap gap-x-3 gap-y-1">
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
                                className="text-xs text-outline cursor-not-allowed underline decoration-dotted"
                                title="通報機能は近日公開予定です"
                            >
                                このぺったんを通報する
                            </button>
                        </div>
                    </div>
                </div>

                {/* このクリエイターの、ほかのぺったん */}
                {otherPacks.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-lg font-bold text-on-surface tracking-wider mb-6">このクリエイターの、他のぺったん</h2>
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
