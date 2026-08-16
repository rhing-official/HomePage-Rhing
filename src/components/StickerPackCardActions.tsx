"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Check } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackFavorited, addFavoritePack, removeFavoritePack } from "@/lib/favorites";
import { isPackOwnedByUser } from "@/lib/stickerPacks";
import { createCheckoutSession } from "@/lib/firebaseFunctions";

type FavoriteStatus = "loading" | "favorited" | "not-favorited";
type GetStatus = "loading" | "owned" | "purchasable";

// カタログカードのサムネイル右上に重ねる、お気に入り・入手の小さな丸アイコン
// ボタン2つ。カード全体が<Link>のため、クリックはstopPropagation/preventDefault
// でカード遷移に巻き込まれないようにする。
export default function StickerPackCardActions({ packId }: { packId: string }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [favoriteStatus, setFavoriteStatus] = useState<FavoriteStatus>("loading");
    const [getStatus, setGetStatus] = useState<GetStatus>("loading");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!authReady) return;
        if (!user) {
            setFavoriteStatus("not-favorited");
            setGetStatus("purchasable");
            return;
        }
        let cancelled = false;
        isPackFavorited(user.uid, packId).then((favorited) => {
            if (!cancelled) setFavoriteStatus(favorited ? "favorited" : "not-favorited");
        });
        isPackOwnedByUser(user.uid, packId).then((owned) => {
            if (!cancelled) setGetStatus(owned ? "owned" : "purchasable");
        });
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packId]);

    const stop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        stop(e);
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        if (favoriteStatus === "favorited") {
            setFavoriteStatus("not-favorited");
            await removeFavoritePack(user.uid, packId);
        } else {
            setFavoriteStatus("favorited");
            await addFavoritePack(user.uid, packId);
        }
    };

    const handleGetClick = async (e: React.MouseEvent) => {
        stop(e);
        if (getStatus !== "purchasable" || submitting) return;
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        setSubmitting(true);
        try {
            const result = await createCheckoutSession({ packId, origin: window.location.origin });
            if (result.url) {
                window.location.href = result.url;
                return;
            }
            if (result.granted) {
                setGetStatus("owned");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!authReady || favoriteStatus === "loading" || getStatus === "loading") {
        return null;
    }

    return (
        <div className="absolute top-2 right-2 flex gap-2">
            <button
                type="button"
                onClick={handleFavoriteClick}
                aria-label={favoriteStatus === "favorited" ? "お気に入り解除" : "お気に入りに追加"}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/70 hover:bg-white/95 transition-colors"
            >
                <Heart
                    className={`w-4 h-4 ${favoriteStatus === "favorited" ? "text-amber-500 fill-amber-500" : "text-gray-400"}`}
                />
            </button>
            <button
                type="button"
                onClick={handleGetClick}
                disabled={getStatus === "owned" || submitting}
                aria-label={getStatus === "owned" ? "入手済み" : "入手する"}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/70 hover:bg-white/95 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
                {getStatus === "owned" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                    <Plus className="w-4 h-4 text-gray-500" />
                )}
            </button>
        </div>
    );
}
