import { Metadata } from "next";
import Link from "next/link";
import { getAllStickerPacks, formatPackPrice } from "@/lib/stickerPacks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "daidai横丁 | Rhing",
    description: "DaiDaiで使えるペタピタ（スタンプ）パッケージのストア、daidai横丁。",
};

export default async function DaidaiYokochoPage() {
    const packs = await getAllStickerPacks();

    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                <p className="text-gray-500 tracking-wider text-sm mb-6">DaiDaiで使えるペタピタ（スタンプ）を手に入れよう</p>
                <Link
                    href="/daidai-yokocho/creator"
                    className="inline-block px-6 py-2.5 bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 rounded-full text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-white/90 hover:shadow-md hover:shadow-blue-300/15 transition-all duration-300"
                >
                    ペタピタを出品する →
                </Link>
            </div>

            {packs.length === 0 ? (
                <div className="container mx-auto px-6 max-w-2xl text-center text-gray-500">
                    <p>現在、横丁に並んでいるパックはありません。近日公開をお楽しみに。</p>
                </div>
            ) : (
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packs.map((pack) => (
                            <Link
                                key={pack.id}
                                href={`/daidai-yokocho/${pack.id}`}
                                className="group flex flex-col bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-2xl"
                            >
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
                                </div>
                                <div className="p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                            {pack.name}
                                        </h2>
                                        <span className={`text-sm font-bold whitespace-nowrap ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                            {formatPackPrice(pack.price)}
                                        </span>
                                    </div>
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
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
