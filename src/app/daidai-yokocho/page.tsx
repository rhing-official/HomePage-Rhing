import { Metadata } from "next";
import { getAllStickerPacks } from "@/lib/stickerPacks";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "daidai横丁 | Rhing",
    description: "DaiDaiで使えるペタピタのストア、daidai横丁。",
};

export default async function DaidaiYokochoPage() {
    const packs = await getAllStickerPacks();

    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">daidai横丁</h1>
                <p className="text-gray-500 tracking-wider text-sm">DaiDaiで使えるペタピタを手に入れよう</p>
            </div>

            <CatalogClient packs={packs} />
        </div>
    );
}
