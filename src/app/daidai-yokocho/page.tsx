import { Metadata } from "next";
import { getAllStickerPacks } from "@/lib/stickerPacks";
import CatalogClient from "./CatalogClient";
import IntroBanner from "@/components/daidai-yokocho/IntroBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "daidai横丁 | Rhing",
    description: "DaiDaiで使えるぺったんと意匠のストア、daidai横丁。",
};

export default async function DaidaiYokochoPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
    const { kind } = await searchParams;
    const packs = await getAllStickerPacks();

    return (
        <div className="w-full pb-24">
            {/* ページタイトル */}
            <div className="container mx-auto px-6 pb-4 max-w-4xl">
                <div className="relative flex flex-col items-center justify-center text-center md:min-h-[11.5rem] lg:min-h-[13.25rem]">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-on-surface mb-4">daidai横丁</h1>
                </div>
            </div>

            <IntroBanner />

            <CatalogClient packs={packs} initialKind={kind === "design" ? "design" : kind === "petan" ? "petan" : undefined} />
        </div>
    );
}
