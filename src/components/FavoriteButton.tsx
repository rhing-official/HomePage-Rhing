"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackFavorited, addFavoritePack, removeFavoritePack } from "@/lib/favorites";

type Status = "loading" | "favorited" | "not-favorited";

export default function FavoriteButton({ packId }: { packId: string }) {
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
            setStatus("not-favorited");
            return;
        }
        let cancelled = false;
        isPackFavorited(user.uid, packId).then((favorited) => {
            if (!cancelled) setStatus(favorited ? "favorited" : "not-favorited");
        });
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packId]);

    const handleClick = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        setSubmitting(true);
        try {
            if (status === "favorited") {
                await removeFavoritePack(user.uid, packId);
                setStatus("not-favorited");
            } else {
                await addFavoritePack(user.uid, packId);
                setStatus("favorited");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!authReady || status === "loading") {
        return (
            <button disabled className="text-sm text-gray-300 cursor-not-allowed">
                読み込み中...
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={submitting}
            className={`text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                status === "favorited" ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
            }`}
        >
            {status === "favorited" ? "★ お気に入り済み" : "☆ お気に入りに追加"}
        </button>
    );
}
