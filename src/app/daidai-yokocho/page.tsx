import { Metadata } from "next";
import { getAllStickerPacks } from "@/lib/stickerPacks";
import CatalogClient from "./CatalogClient";
import IntroBanner from "@/components/daidai-yokocho/IntroBanner";

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
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/illustrations/online-shopping.svg" alt="" className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-48 lg:w-56 h-auto" />
                </div>
            </div>

            <IntroBanner />

            <CatalogClient packs={packs} />
        </div>
    );
}
