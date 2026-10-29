"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
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

    // 記号（ハート）だけで状態が分かるようにする。文字は出さず、読み上げ用のラベルだけ付ける
    if (!authReady || status === "loading") {
        return (
            <button disabled aria-label="読み込み中" className="p-2 rounded-full text-gray-300 cursor-not-allowed">
                <Heart className="w-6 h-6" />
            </button>
        );
    }

    const favorited = status === "favorited";
    return (
        <button
            onClick={handleClick}
            disabled={submitting}
            aria-label={favorited ? "お気に入り解除" : "お気に入りに追加"}
            aria-pressed={favorited}
            className="p-2 rounded-full transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Heart className={`w-6 h-6 ${favorited ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
        </button>
    );
}
