"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { addManyDesignsToCart, selectAddableDesigns, type AddManyDesignsResult } from "@/lib/designLists";
import type { PublicThemePack } from "@/lib/themePackReview";
import { useCart } from "@/components/CartProvider";
import Button from "@/components/ui/Button";
import { flyToChip } from "@/lib/flyToChip";
import { freezeChipCount } from "@/lib/chipCount";

// 表示中の意匠を、まとめてカートに追加するボタン（取得はカートのページで行う）。
// ぺったんの BulkAddToCartButton と同じ作り
export default function BulkAddDesignsButton({ packs, label }: { packs: PublicThemePack[]; label: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, authReady, designIds } = useCart();
    const [count, setCount] = useState<number | null>(null);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<AddManyDesignsResult | null>(null);

    // カートに追加できる件数（取得済み・カート済みを除く）
    useEffect(() => {
        if (!authReady) return;
        if (!user) {
            setCount(packs.length);
            return;
        }
        let cancelled = false;
        selectAddableDesigns(packs, user.uid, designIds)
            .then((r) => !cancelled && setCount(r.addable.length))
            .catch(() => !cancelled && setCount(0));
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packs, designIds]);

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
            const r = await addManyDesignsToCart(packs, user.uid, designIds);
            setResult(r);
            if (r.added > 0) flyToChip(button, "cart", release);
            else release();
        } catch {
            release();
            setResult({ added: 0, skippedOwned: 0, skippedInCart: 0, skippedOverLimit: -1 });
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
                            {result.skippedOverLimit > 0 && `。上限の為、${result.skippedOverLimit}件は追加出来ませんでした`}
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
