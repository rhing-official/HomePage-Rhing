"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { isPackOwnedByUser, formatPackPrice } from "@/lib/stickerPacks";
import { createCheckoutSession } from "@/lib/firebaseFunctions";

type Status = "loading" | "owned" | "purchasable";

export default function PurchaseButton({ packId, price }: { packId: string; price: number }) {
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
            <button disabled className="w-full sm:w-auto bg-gray-200 text-gray-400 px-8 py-3 rounded-full cursor-not-allowed">
                読み込み中...
            </button>
        );
    }

    if (status === "owned") {
        return (
            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-8 py-3 rounded-full font-bold">
                入手済み
            </span>
        );
    }

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={submitting}
                className="w-full sm:w-auto bg-amber-500 text-white px-8 py-3 rounded-full hover:bg-amber-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? "処理中..." : price === 0 ? "無料で入手する" : `購入する（${formatPackPrice(price)}）`}
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
