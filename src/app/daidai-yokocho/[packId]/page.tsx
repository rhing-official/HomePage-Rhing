import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStickerPackById, formatPackPrice } from "@/lib/stickerPacks";

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
}: {
    params: Promise<{ packId: string }>;
}) {
    const { packId } = await params;
    const pack = await getStickerPackById(packId);

    if (!pack) {
        notFound();
    }

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl overflow-hidden p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                        <div>
                            {pack.category && (
                                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">
                                    {pack.category}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wider">{pack.name}</h1>
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
                        <div className="text-left md:text-right shrink-0">
                            <p className={`text-2xl font-bold ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                {formatPackPrice(pack.price)}
                            </p>
                        </div>
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

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            disabled
                            className="w-full sm:w-auto bg-amber-500/50 text-white px-8 py-3 rounded-full shadow-lg cursor-not-allowed"
                            title="購入機能は近日公開予定です"
                        >
                            購入する（近日公開）
                        </button>
                        <button
                            disabled
                            className="text-sm text-gray-400 cursor-not-allowed underline decoration-dotted"
                            title="通報機能は近日公開予定です"
                        >
                            このパックを通報する（近日公開）
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
