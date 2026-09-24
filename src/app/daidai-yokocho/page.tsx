import { Metadata } from "next";
import { getAllStickerPacks } from "@/lib/stickerPacks";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "daidai横丁 | Rhing",
    description: "DaiDaiで使えるぺったんのストア、daidai横丁。",
};

export default async function DaidaiYokochoPage() {
    const packs = await getAllStickerPacks();

    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 pb-24 max-w-4xl">
                <div className="relative flex flex-col items-center justify-center text-center md:min-h-56 lg:min-h-64">
                    {/* 「春夏冬中」＝あきない（商い）のしゃれ言葉。のぼり旗はCSSのみで表現し、画像素材は使用していない */}
                    <div className="hidden md:flex items-start gap-1.5 absolute right-0 top-1/2 -translate-y-1/2">
                        <span className="w-1.5 h-56 md:h-64 rounded-full bg-gray-700" />
                        <div className="flex items-start justify-center pt-6 md:pt-8 w-16 md:w-20 h-44 md:h-52 bg-[#B7282E] shadow-md">
                            <span
                                className="text-white font-bold text-2xl md:text-3xl tracking-[0.3em]"
                                style={{ writingMode: "vertical-rl" }}
                            >
                                春夏冬中
                            </span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/illustrations/online-shopping.svg" alt="" className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-48 lg:w-56 h-auto" />
                </div>
            </div>

            <CatalogClient packs={packs} />
        </div>
    );
}
