"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackFavorited, addFavoritePack, removeFavoritePack } from "@/lib/favorites";
import { isPackOwnedByUser } from "@/lib/stickerPacks";
import { PACKS_OWNED_EVENT } from "@/lib/bulkAcquire";
import { useCart } from "@/components/CartProvider";
import { flyFromChip, flyToChip } from "@/lib/flyToChip";
import { freezeChipCount } from "@/lib/chipCount";

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
        const button = e.currentTarget; // await の後では、取れなくなる
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        // 失敗したとき（通信の失敗等）は、表示を元に戻す
        const before = favoriteStatus;
        // 追加は、点が着くまで、解除は、点が飛び立つまで、チップの件数を変えない
        const release = freezeChipCount("favorite");
        try {
            if (before === "favorited") {
                setFavoriteStatus("not-favorited");
                await removeFavoritePack(user.uid, packId);
                flyFromChip(button, "favorite", release);
            } else {
                setFavoriteStatus("favorited");
                await addFavoritePack(user.uid, packId);
                flyToChip(button, "favorite", release);
            }
        } catch {
            setFavoriteStatus(before);
            release();
        }
    };

    const cart = useCart();
    const inCart = cart.has(packId);

    // 入手済みでなければ、カートに追加する。入っている時は、もう一度押すと、カートから外す（お気に入りと同じ）。入手は、カートのページ、または販売ページから
    const handleCartClick = async (e: React.MouseEvent) => {
        stop(e);
        const button = e.currentTarget;
        if (getStatus !== "purchasable") return;
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        // 追加は、点が着くまで、外すのは、点が飛び立つまで、チップの件数を変えない
        const release = freezeChipCount("cart");
        if (inCart) {
            await cart.remove(packId);
            flyFromChip(button, "cart", release);
            return;
        }
        if ((await cart.add(packId)).ok) flyToChip(button, "cart", release);
        else release();
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
                className="p-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm border border-glass-edge/70 hover:bg-surface-container-lowest/95 transition-colors"
            >
                <Heart
                    className={`w-4 h-4 ${favoriteStatus === "favorited" ? "text-rose-500 dark:text-rose-400 fill-rose-500" : "text-outline"}`}
                />
            </button>
            <button
                type="button"
                onClick={handleCartClick}
                disabled={getStatus === "owned"}
                aria-label={getStatus === "owned" ? "入手済み" : inCart ? "カートから外す" : "カートに追加"}
                className="p-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm border border-glass-edge/70 hover:bg-surface-container-lowest/95 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
                {getStatus === "owned" ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <ShoppingCart className={`w-4 h-4 ${inCart ? "text-blue-600 dark:text-blue-400 fill-blue-100" : "text-on-surface-subtle"}`} />
                )}
            </button>
        </div>
    );
}
