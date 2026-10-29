"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { getStickerPackById, isPackOwnedByUser, formatPackPrice, type StickerPack } from "@/lib/stickerPacks";
import { checkoutCart, removeFromCart, type CheckoutResult } from "@/lib/cart";
import Button from "@/components/ui/Button";

const CART_PATH = "/daidai-yokocho/cart";

export default function CartPage() {
    const router = useRouter();
    const { user, authReady, cartReady, ids, remove } = useCart();
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [result, setResult] = useState<CheckoutResult | null>(null);

    useEffect(() => {
        if (authReady && !user) router.replace(`/login?redirect=${encodeURIComponent(CART_PATH)}`);
    }, [authReady, user, router]);

    // カートの中身（ID）が変わるたびに、パックの詳細を取り直す。入手済み・削除済みのパックはカートから外す
    const idsKey = useMemo(() => Array.from(ids).sort().join(","), [ids]);
    useEffect(() => {
        if (!user || !cartReady) return;
        let cancelled = false;
        (async () => {
            const list = idsKey ? idsKey.split(",") : [];
            const fetched = await Promise.all(list.map((id) => getStickerPackById(id)));
            const alive: StickerPack[] = [];
            for (const [i, pack] of fetched.entries()) {
                if (!pack || (await isPackOwnedByUser(user.uid, list[i]))) {
                    await removeFromCart(user.uid, list[i]);
                } else {
                    alive.push(pack);
                }
            }
            if (!cancelled) {
                setPacks(alive);
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, cartReady, idsKey]);

    if (!authReady || !user) return null;

    const free = packs.filter((p) => p.price === 0);
    const paid = packs.length - free.length;
    const running = progress !== null;

    const handleCheckout = async () => {
        if (free.length === 0) return;
        if (!window.confirm(`${free.length}件の無料パックを入手します。よろしいですか？`)) return;
        setResult(null);
        setProgress({ done: 0, total: free.length });
        try {
            const r = await checkoutCart(packs, user.uid, (done, total) => setProgress({ done, total }));
            setResult(r);
        } finally {
            setProgress(null);
        }
    };

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <h1 className="text-3xl font-bold tracking-widest text-gray-900 mb-12">カート</h1>

                {loading ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : packs.length === 0 ? (
                    <div className="flex flex-col items-start gap-3">
                        {result ? (
                            <p className="text-sm text-gray-700" role="status">
                                {result.acquired.length}件入手しました。
                                <Link href="/daidai-yokocho/owned" className="text-blue-600 hover:underline ml-1">
                                    購入済みのぺったんを見る →
                                </Link>
                            </p>
                        ) : (
                            <p className="text-gray-400 text-sm">カートは空です。</p>
                        )}
                        <Link href="/daidai-yokocho" className="text-sm text-blue-600 hover:underline">
                            daidai横丁で探す →
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="flex flex-col gap-3">
                            {packs.map((pack) => (
                                <li
                                    key={pack.id}
                                    className="flex items-center gap-4 bg-white border border-gray-100 shadow-elevation-1 rounded-m3-lg p-3"
                                >
                                    <Link href={`/daidai-yokocho/${pack.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                                        <div className="w-20 h-20 shrink-0 bg-white rounded-m3-md flex items-center justify-center overflow-hidden">
                                            {pack.stickers[0]?.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={pack.stickers[0].imageUrl} alt="" className="w-full h-full object-contain p-1" />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{pack.name}</p>
                                            <p className={`text-sm font-bold ${pack.price === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                                {formatPackPrice(pack.price)}
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => remove(pack.id)}
                                        aria-label={`${pack.name}をカートから外す`}
                                        disabled={running}
                                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition disabled:opacity-40"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex flex-col gap-3 items-start">
                            <p className="text-sm text-gray-600">
                                無料パック {free.length}件
                                {paid > 0 && (
                                    <span className="text-amber-600 ml-2">
                                        有料パック{paid}件は、現在購入できません（カートには残ります）
                                    </span>
                                )}
                            </p>
                            <Button size="lg" onClick={handleCheckout} disabled={running || free.length === 0}>
                                {running ? `入手中… ${progress.done}/${progress.total}` : `まとめて入手（${free.length}件）`}
                            </Button>
                            {result && !running && (
                                <p className="text-sm text-gray-700" role="status">
                                    {result.acquired.length}件入手しました
                                    {result.alreadyOwned > 0 && `（入手済み${result.alreadyOwned}件）`}
                                    {result.failed > 0 && `。${result.failed}件は失敗しました。もう一度お試しください`}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
