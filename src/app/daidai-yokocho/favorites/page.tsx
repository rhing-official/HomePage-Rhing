"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getFavoritedStickerPacks, removeFavoritePack } from "@/lib/favorites";
import type { StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";

const FAVORITES_PATH = "/daidai-yokocho/favorites";

export default function FavoritePacksPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(FAVORITES_PATH)}`);
        }
    }, [ready, user, router]);

    const reload = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            const favoritedPacks = await getFavoritedStickerPacks(uid);
            setPacks(favoritedPacks);
            setCreatorProfiles(await getCreatorProfiles(favoritedPacks.map((p) => p.creatorId)));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) reload(user.uid);
    }, [user, reload]);

    if (!ready || !user) return null;

    const handleRemove = async (packId: string) => {
        await removeFavoritePack(user.uid, packId);
        setPacks((prev) => prev.filter((p) => p.id !== packId));
    };

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <h1 className="text-3xl font-bold tracking-widest text-gray-900 mb-12">お気に入りのペタピタ</h1>

                {loading ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : packs.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        まだお気に入りのパックがありません。
                        <Link href="/daidai-yokocho" className="text-blue-600 hover:underline ml-1">
                            daidai横丁で探す →
                        </Link>
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packs.map((pack) => (
                            <div key={pack.id} className="flex flex-col gap-2">
                                <StickerPackCard pack={pack} creator={creatorProfiles.get(pack.creatorId) ?? null} />
                                <button
                                    type="button"
                                    onClick={() => handleRemove(pack.id)}
                                    className="self-start text-xs text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    お気に入りから外す
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
