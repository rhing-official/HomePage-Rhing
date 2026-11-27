import type { Metadata } from "next";
import DesignDetailClient from "./DesignDetailClient";

export const metadata: Metadata = {
    title: "意匠 | daidai横丁 | Rhing",
    description: "daidai横丁で頒布中の意匠。DaiDaiの色・形・背景を着せ替えます。",
};

export default async function DesignDetailPage({ params }: { params: Promise<{ packId: string }> }) {
    const { packId } = await params;
    return <DesignDetailClient packId={decodeURIComponent(packId)} />;
}
