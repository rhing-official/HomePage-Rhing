"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { addManyToCart, selectAddableToCart, type AddManyResult } from "@/lib/cart";
import type { StickerPack } from "@/lib/stickerPacks";
import { useCart } from "@/components/CartProvider";
import Button from "@/components/ui/Button";
import { flyToChip } from "@/lib/flyToChip";
import { freezeChipCount } from "@/lib/chipCount";

// 表示中のぺったんを、まとめてカートに追加するボタン（入手はカートのページで行う）
export default function BulkAddToCartButton({ packs, label }: { packs: StickerPack[]; label: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, authReady, ids } = useCart();
    const [count, setCount] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<AddManyResult | null>(null);

    // カートに追加できる件数（入手済み・自分の出品・カート済みを除く）
    useEffect(() => {
        if (!authReady) return;
        if (!user) {
            setCount(packs.length);
            return;
        }
        let cancelled = false;
        selectAddableToCart(packs, user.uid, ids).then((r) => {
            if (!cancelled) setCount(r.addable.length);
        });
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packs, ids]);

    const handleClick = async (e: React.MouseEvent) => {
        const button = e.currentTarget;
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        setRunning(true);
        setResult(null);
        // 点が着くまで、チップの件数を増やさない
        const release = freezeChipCount("cart");
        try {
            const r = await addManyToCart(packs, user.uid, ids);
            setResult(r);
            if (r.added > 0) flyToChip(button, "cart", release);
            else release();
        } catch {
            release();
            setResult({ added: 0, skippedOwned: 0, skippedInCart: 0, skippedOwnPack: 0, skippedOverLimit: -1 });
        } finally {
            setRunning(false);
        }
    };

    if (count === null) return null;
    if (count === 0 && !result) return null;

    const failed = result?.skippedOverLimit === -1;

    return (
        <div className="flex flex-col items-start gap-2">
            {count > 0 && (
                <Button variant="tonal" onClick={handleClick} disabled={running}>
                    {running ? "追加中…" : `${label}（${count}件）`}
                </Button>
            )}
            {result && !running && (
                <p className="text-sm text-on-surface-variant" role="status">
                    {failed ? (
                        "カートに追加出来ませんでした。時間をおいてお試しください。"
                    ) : (
                        <>
                            {result.added}件をカートに追加しました
                            {result.skippedOverLimit > 0 && `（上限のため${result.skippedOverLimit}件は追加出来ませんでした）`}
                            {" "}
                            <Link href="/daidai-yokocho/cart" className="text-blue-600 dark:text-blue-400 hover:underline">
                                カートを見る →
                            </Link>
                        </>
                    )}
                </p>
            )}
        </div>
    );
}
