"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackOwnedByUser } from "@/lib/stickerPacks";
import { createCheckoutSession } from "@/lib/firebaseFunctions";
import { PACKS_OWNED_EVENT } from "@/lib/bulkAcquire";
import { useCart } from "@/components/CartProvider";

type Status = "loading" | "owned" | "purchasable";

// extra: カートに追加の隣に置く部品（お気に入りのハートなど）
export default function PurchaseButton({ packId, extra }: { packId: string; extra?: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [status, setStatus] = useState<Status>("loading");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!authReady) return;
        if (!user) {
            setStatus("purchasable");
            return;
        }
        let cancelled = false;
        isPackOwnedByUser(user.uid, packId).then((owned) => {
            if (!cancelled) setStatus(owned ? "owned" : "purchasable");
        });
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packId]);

    // 一括入手（BulkAcquireButton）で入手済みになったら、表示を更新する
    useEffect(() => {
        const onOwned = (e: Event) => {
            const ids = (e as CustomEvent<{ packIds: string[] }>).detail?.packIds ?? [];
            if (ids.includes(packId)) setStatus("owned");
        };
        window.addEventListener(PACKS_OWNED_EVENT, onOwned);
        return () => window.removeEventListener(PACKS_OWNED_EVENT, onOwned);
    }, [packId]);

    const cart = useCart();
    const inCart = cart.has(packId);
    const handleCartClick = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        setError(null);
        if (inCart) {
            await cart.remove(packId);
            return;
        }
        const r = await cart.add(packId);
        if (!r.ok) setError(r.reason === "limit" ? "カートがいっぱいです（50件まで）" : "カートに追加できませんでした");
    };

    const handleClick = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(`/daidai-yokocho/${packId}`)}`);
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            const result = await createCheckoutSession({ packId, origin: window.location.origin });
            if (result.url) {
                window.location.href = result.url;
                return;
            }
            if (result.granted) {
                setStatus("owned");
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "処理に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    if (!authReady || status === "loading") {
        return (
            <button disabled className="w-full bg-gray-200 text-gray-400 px-8 py-3.5 rounded-full cursor-not-allowed">
                読み込み中...
            </button>
        );
    }

    if (status === "owned") {
        return (
            <div className="flex items-center gap-2">
                <span className="flex-1 text-center bg-emerald-50 text-emerald-700 border border-emerald-200 px-8 py-3.5 rounded-full font-bold">
                    入手済み
                </span>
                {extra}
            </div>
        );
    }

    const getButton = (
        <button
            onClick={handleClick}
            disabled={submitting}
            className="w-full bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold tracking-wider hover:bg-primary/90 hover:shadow-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {submitting ? "処理中..." : "入手する"}
        </button>
    );

    const cartButton = (
        <button
            onClick={handleCartClick}
            aria-pressed={inCart}
            aria-label={inCart ? "カートから外す" : "カートに追加"}
            className={`inline-flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-full border font-bold transition ${
                inCart
                    ? "border-primary bg-primary-container text-on-primary-container"
                    : "border-outline text-on-surface-variant hover:border-primary hover:text-primary"
            }`}
        >
            <ShoppingCart className="w-5 h-5" />
            {inCart ? "カートから外す" : "カートに追加"}
        </button>
    );

    return (
        <div className="flex flex-col gap-3 w-full">
            {getButton}
            <div className="flex items-center gap-2">
                {cartButton}
                {extra}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
