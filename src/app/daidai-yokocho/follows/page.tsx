"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getFollowedCreatorIds, unfollowCreator } from "@/lib/follows";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";

const FOLLOWS_PATH = "/daidai-yokocho/follows";

export default function FollowedCreatorsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [creators, setCreators] = useState<CreatorProfile[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(FOLLOWS_PATH)}`);
        }
    }, [ready, user, router]);

    const reload = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            const ids = await getFollowedCreatorIds(uid);
            const profiles = await getCreatorProfiles(ids);
            setCreators(ids.map((id) => profiles.get(id)).filter((p): p is CreatorProfile => !!p));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) reload(user.uid);
    }, [user, reload]);

    if (!ready || !user) return null;

    const handleUnfollow = async (creatorId: string) => {
        await unfollowCreator(user.uid, creatorId);
        setCreators((prev) => prev.filter((c) => c.userId !== creatorId));
    };

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-16 max-w-2xl">
                <h1 className="text-3xl font-bold tracking-widest text-gray-900 mb-12">フォロー中のクリエイター</h1>

                {loading ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : creators.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        まだ誰もフォローしていません。
                        <Link href="/daidai-yokocho" className="text-blue-600 hover:underline ml-1">
                            daidai横丁で探す →
                        </Link>
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {creators.map((creator) => (
                            <div
                                key={creator.userId}
                                className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-5 flex items-center justify-between gap-4"
                            >
                                <Link
                                    href={`/daidai-yokocho/creator/${creator.userId}`}
                                    className="flex items-center gap-3 min-w-0"
                                >
                                    {creator.iconUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={creator.iconUrl}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover border border-white/80 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">
                                            {creator.nickname ?? creator.rhingId}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">@{creator.rhingId}</p>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleUnfollow(creator.userId)}
                                    className="text-sm text-gray-400 hover:text-red-600 transition-colors shrink-0"
                                >
                                    フォロー解除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
