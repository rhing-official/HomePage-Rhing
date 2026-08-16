import Link from "next/link";
import type { StickerPack } from "@/lib/stickerPacks";
import { formatPackPrice } from "@/lib/stickerPacks";
import type { CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCardActions from "@/components/StickerPackCardActions";

export default function StickerPackCard({
    pack,
    creator,
}: {
    pack: StickerPack;
    // undefined: クリエイター情報を取得中（スケルトン表示）
    // null: creatorProfilesが存在しない（非表示）
    creator?: CreatorProfile | null;
}) {
    return (
        // カード全体を単一の<Link>にすると、クリエイター行を別リンクとして
        // 入れ子にできない（<a>の中に<a>はHTML的に無効）ため、外枠は<div>にし
        // 「画像・パック名」への遷移リンクと「クリエイター」への遷移リンクを
        // 兄弟要素として分ける。
        <div className="group flex flex-col bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-2xl">
            <Link href={`/daidai-yokocho/${pack.id}`} className="flex flex-col">
                <div className="relative w-full aspect-square bg-gray-100/60 flex items-center justify-center overflow-hidden">
                    {pack.stickers[0]?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={pack.stickers[0].imageUrl}
                            alt={pack.name}
                            className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <span className="text-gray-300 text-sm">No Image</span>
                    )}
                    <StickerPackCardActions packId={pack.id} />
                </div>
                <div className="px-6 pt-6 flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {pack.name}
                    </h2>
                    <span className={`text-sm font-bold whitespace-nowrap ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {formatPackPrice(pack.price)}
                    </span>
                </div>
            </Link>

            <div className="px-6 pb-6 flex flex-col gap-3">
                {creator === undefined ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-5 h-5 rounded-full bg-gray-200" />
                        <div className="h-3 w-16 rounded-full bg-gray-200" />
                    </div>
                ) : creator ? (
                    <Link
                        href={`/daidai-yokocho/creator/${creator.userId}`}
                        className="group/creator flex items-center gap-2 min-w-0 w-fit"
                    >
                        {creator.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={creator.iconUrl}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover shrink-0 border border-white/80"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <span className="text-xs text-gray-500 group-hover/creator:text-blue-600 transition-colors truncate">
                            {creator.nickname ?? creator.rhingId}
                        </span>
                    </Link>
                ) : null}

                {(pack.category || pack.tags.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                        {pack.category && (
                            <span className="text-[10px] font-bold bg-gray-50/80 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider border border-gray-200/50">
                                {pack.category}
                            </span>
                        )}
                        {pack.tags.map((tag) => (
                            <span key={tag} className="text-[10px] text-gray-400 px-2 py-1">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
