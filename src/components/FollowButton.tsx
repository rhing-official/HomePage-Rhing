"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isFollowing, followCreator, unfollowCreator } from "@/lib/follows";

type Status = "loading" | "following" | "not-following";

export default function FollowButton({ creatorId }: { creatorId: string }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [status, setStatus] = useState<Status>("loading");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!authReady) return;
        if (!user) {
            setStatus("not-following");
            return;
        }
        let cancelled = false;
        isFollowing(user.uid, creatorId).then((following) => {
            if (!cancelled) setStatus(following ? "following" : "not-following");
        });
        return () => {
            cancelled = true;
        };
    }, [authReady, user, creatorId]);

    const handleClick = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/creator/${creatorId}`)}`);
            return;
        }
        setSubmitting(true);
        try {
            if (status === "following") {
                await unfollowCreator(user.uid, creatorId);
                setStatus("not-following");
            } else {
                await followCreator(user.uid, creatorId);
                setStatus("following");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!authReady || status === "loading") {
        return (
            <button disabled className="px-6 py-2 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed text-sm font-bold">
                読み込み中...
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={submitting}
            className={`px-6 py-2 rounded-full text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "following"
                    ? "bg-white/70 border border-gray-300 text-gray-600 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow"
            }`}
        >
            {status === "following" ? "フォロー中" : "フォローする"}
        </button>
    );
}
