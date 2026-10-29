"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackFavorited, addFavoritePack, removeFavoritePack } from "@/lib/favorites";
import { isPackOwnedByUser } from "@/lib/stickerPacks";
import { PACKS_OWNED_EVENT } from "@/lib/bulkAcquire";
import { useCart } from "@/components/CartProvider";

type FavoriteStatus = "loading" | "favorited" | "not-favorited";
type GetStatus = "loading" | "owned" | "purchasable";

// カタログカードのサムネイル右上に重ねる、お気に入り・入手の小さな丸アイコン
// ボタン2つ。カード全体が<Link>のため、クリックはstopPropagation/preventDefault
// でカード遷移に巻き込まれないようにする。
export default function StickerPackCardActions({ packId }: { packId: string }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [favoriteState, setFavoriteStatus] = useState<FavoriteStatus>("loading");
    const [getState, setGetStatus] = useState<GetStatus>("loading");
    // 未ログインは、お気に入りなし・入手可能として扱う
    const favoriteStatus: FavoriteStatus = authReady && !user ? "not-favorited" : favoriteState;
    const getStatus: GetStatus = authReady && !user ? "purchasable" : getState;

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!authReady) return;
        if (!user) return;
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

    // 一括入手（BulkAcquireButton）で入手済みになったら、表示を更新する
    useEffect(() => {
        const onOwned = (e: Event) => {
            const ids = (e as CustomEvent<{ packIds: string[] }>).detail?.packIds ?? [];
            if (ids.includes(packId)) setGetStatus("owned");
        };
        window.addEventListener(PACKS_OWNED_EVENT, onOwned);
        return () => window.removeEventListener(PACKS_OWNED_EVENT, onOwned);
    }, [packId]);

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
        // 失敗したとき（自分の出品へのお気に入りは、ルールで拒否される等）は、表示を元に戻す
        const before = favoriteStatus;
        try {
            if (before === "favorited") {
                setFavoriteStatus("not-favorited");
                await removeFavoritePack(user.uid, packId);
            } else {
                setFavoriteStatus("favorited");
                await addFavoritePack(user.uid, packId);
            }
        } catch {
            setFavoriteStatus(before);
        }
    };

    const cart = useCart();
    const inCart = cart.has(packId);

    // 入手済みでなければ、カートに追加/カートから外す（入手はカートのページ、または販売ページから）
    const handleCartClick = async (e: React.MouseEvent) => {
        stop(e);
        if (getStatus !== "purchasable") return;
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        if (inCart) await cart.remove(packId);
        else await cart.add(packId);
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
                    className={`w-4 h-4 ${favoriteStatus === "favorited" ? "text-rose-500 fill-rose-500" : "text-gray-400"}`}
                />
            </button>
            <button
                type="button"
                onClick={handleCartClick}
                disabled={getStatus === "owned"}
                aria-label={getStatus === "owned" ? "入手済み" : inCart ? "カートから外す" : "カートに追加"}
                aria-pressed={inCart}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/70 hover:bg-white/95 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
                {getStatus === "owned" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                    <ShoppingCart className={`w-4 h-4 ${inCart ? "text-blue-600 fill-blue-100" : "text-gray-500"}`} />
                )}
            </button>
        </div>
    );
}
