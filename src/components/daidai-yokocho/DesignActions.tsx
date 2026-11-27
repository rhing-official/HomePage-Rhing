"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { addToDesignList, isInDesignList, removeFromDesignList } from "@/lib/designLists";
import { isThemePackOwned } from "@/lib/themePackReview";
import { useCart } from "@/components/CartProvider";

type Fav = "loading" | "favorited" | "not-favorited";
type Own = "loading" | "owned" | "notOwned";

// 意匠のお気に入りとカートのボタン。ぺったんの StickerPackCardActions（カード）と FavoriteButton（詳細）に揃える。
// variant="card": カードのサムネイル右上に重ねる小さな丸。カード全体が<Link>なので、クリックは遷移に巻き込まない
// variant="detail": 詳細ページの取得ボタンの隣に並べる大きめのボタン
export default function DesignActions({
    packId,
    status = "approved",
    variant,
}: {
    packId: string;
    status?: string;
    variant: "card" | "detail";
}) {
    const router = useRouter();
    const cart = useCart();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [favState, setFav] = useState<Fav>("loading");
    const [ownState, setOwn] = useState<Own>("loading");
    const fav: Fav = authReady && !user ? "not-favorited" : favState;
    const own: Own = authReady && !user ? "notOwned" : ownState;

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!authReady || !user) return;
        let cancelled = false;
        isInDesignList(user.uid, "favoriteDesigns", packId).then((v) => !cancelled && setFav(v ? "favorited" : "not-favorited"));
        isThemePackOwned(user.uid, packId)
            .then((v) => !cancelled && setOwn(v ? "owned" : "notOwned"))
            .catch(() => !cancelled && setOwn("notOwned"));
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packId]);

    const loginPath = `/login?redirect=${encodeURIComponent(`/daidai-yokocho/designs/${packId}`)}`;
    const inCart = cart.hasDesign(packId);
    // 公開中でない意匠は、新しくカートに入れられない（入っているものは外せる）
    const canAddToCart = status === "approved" && own === "notOwned";

    const toggleFavorite = async (e: React.MouseEvent) => {
        if (variant === "card") {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!user) {
            router.push(loginPath);
            return;
        }
        // 失敗したとき（通信の失敗等）は、表示を元に戻す
        const before = fav;
        try {
            if (before === "favorited") {
                setFav("not-favorited");
                await removeFromDesignList(user.uid, "favoriteDesigns", packId);
            } else {
                setFav("favorited");
                await addToDesignList(user.uid, "favoriteDesigns", packId);
            }
        } catch {
            setFav(before);
        }
    };

    const toggleCart = async (e: React.MouseEvent) => {
        if (variant === "card") {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!user) {
            router.push(loginPath);
            return;
        }
        // カートに入っている時は、カートのページへ移る（外すのは、カートのページで行う）
        if (inCart) router.push("/daidai-yokocho/cart");
        else if (canAddToCart) await cart.addDesign(packId);
    };

    if (!authReady || fav === "loading" || own === "loading") return null;

    const favLabel = fav === "favorited" ? "お気に入り解除" : "お気に入りに追加";
    const cartLabel = own === "owned" ? "取得済み" : inCart ? "カートを見る" : "カートに追加";
    const cartDisabled = own === "owned" || (!inCart && !canAddToCart && !!user);

    if (variant === "card") {
        const round =
            "p-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm border border-glass-edge/70 hover:bg-surface-container-lowest/95 transition-colors disabled:cursor-not-allowed disabled:opacity-60";
        return (
            <div className="absolute top-2 right-2 flex gap-2">
                <button type="button" onClick={toggleFavorite} aria-label={favLabel} className={round}>
                    <Heart className={`w-4 h-4 ${fav === "favorited" ? "text-rose-500 dark:text-rose-400 fill-rose-500" : "text-outline"}`} />
                </button>
                <button type="button" onClick={toggleCart} disabled={cartDisabled} aria-label={cartLabel} className={round}>
                    {own === "owned" ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <ShoppingCart className={`w-4 h-4 ${inCart ? "text-blue-600 dark:text-blue-400 fill-blue-100" : "text-on-surface-subtle"}`} />
                    )}
                </button>
            </div>
        );
    }

    const flat = "p-3 rounded-full border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition disabled:cursor-not-allowed disabled:opacity-50";
    return (
        <div className="flex gap-3">
            <button type="button" onClick={toggleFavorite} aria-label={favLabel} aria-pressed={fav === "favorited"} className={flat}>
                <Heart className={`w-6 h-6 ${fav === "favorited" ? "text-rose-500 dark:text-rose-400 fill-rose-500" : "text-outline"}`} />
            </button>
            <button type="button" onClick={toggleCart} disabled={cartDisabled} aria-label={cartLabel} className={flat}>
                {own === "owned" ? (
                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <ShoppingCart className={`w-6 h-6 ${inCart ? "text-blue-600 dark:text-blue-400 fill-blue-100" : "text-on-surface-subtle"}`} />
                )}
            </button>
        </div>
    );
}
