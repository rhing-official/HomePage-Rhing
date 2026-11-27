"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import Button from "@/components/ui/Button";
import { ThumbRowSkeleton } from "@/components/Skeleton";
import { acquireThemePack } from "@/lib/firebaseFunctions";
import { checkoutDesignCart, loadDesignList, type DesignCheckoutResult } from "@/lib/designLists";
import { loadThemePackPreview, type PublicThemePack, type ThemePackPreviewData } from "@/lib/themePackReview";
import { DesignSwatch, brightnessLabel } from "./DesignCard";

function Row({ pack, disabled, onRemove }: { pack: PublicThemePack; disabled: boolean; onRemove: () => void }) {
    const [data, setData] = useState<ThemePackPreviewData | null>(null);
    useEffect(() => {
        let cancelled = false;
        loadThemePackPreview(pack.assetPath)
            .then((d) => !cancelled && setData(d))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [pack.assetPath]);
    return (
        <li className="flex items-center gap-4 bg-white border border-gray-100 shadow-elevation-1 rounded-m3-lg p-3">
            <Link href={`/daidai-yokocho/designs/${pack.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                <DesignSwatch data={data} className="w-20 h-20 shrink-0 rounded-m3-md overflow-hidden" />
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{pack.name}</p>
                    <p className="text-sm font-bold text-emerald-600">無料</p>
                    <p className="text-xs text-gray-500">{brightnessLabel[pack.brightness] ?? ""}</p>
                </div>
            </Link>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`${pack.name}をカートから外す`}
                disabled={disabled}
                className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition disabled:opacity-40"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </li>
    );
}

// 意匠のカード（「カート」の意匠の側）。ぺったんのカートと同じ作りで、まとめて取得する。
// 取得済み・存在しない・取り下げの意匠は、読み込みの時にカートから外す。配信停止は、消さずに隠す
export default function CartDesigns({ uid }: { uid: string }) {
    const { designIds, cartReady, removeDesign } = useCart();
    const [packs, setPacks] = useState<PublicThemePack[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [result, setResult] = useState<DesignCheckoutResult | null>(null);

    const idsKey = useMemo(() => Array.from(designIds).sort().join(","), [designIds]);
    useEffect(() => {
        if (!cartReady) return;
        let cancelled = false;
        loadDesignList(uid, "cartDesigns", idsKey ? idsKey.split(",") : []).then((list) => {
            if (cancelled) return;
            setPacks(list);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [uid, cartReady, idsKey]);

    const running = progress !== null;

    const handleCheckout = async () => {
        if (packs.length === 0) return;
        if (!window.confirm(`${packs.length}件の意匠を取得します。よろしいですか？`)) return;
        setResult(null);
        setProgress({ done: 0, total: packs.length });
        try {
            setResult(
                await checkoutDesignCart(uid, packs.map((p) => p.id), (id) => acquireThemePack({ packId: id }), (done, total) => setProgress({ done, total })),
            );
        } finally {
            setProgress(null);
        }
    };

    if (loading) return <ThumbRowSkeleton />;
    if (packs.length === 0) {
        return (
            <div className="flex flex-col items-start gap-3">
                {result ? (
                    <p className="text-sm text-gray-700" role="status">
                        {result.acquired.length}件取得しました。
                        <Link href="/daidai-yokocho/owned" className="text-blue-600 hover:underline ml-1">
                            購入済みの意匠を見る →
                        </Link>
                    </p>
                ) : (
                    <p className="text-gray-400 text-sm">カートに意匠は有りません。</p>
                )}
                <Link href="/daidai-yokocho?kind=design" className="text-sm text-blue-600 hover:underline">
                    daidai横丁で探す →
                </Link>
            </div>
        );
    }
    return (
        <>
            <ul className="flex flex-col gap-3">
                {packs.map((pack) => (
                    <Row key={pack.id} pack={pack} disabled={running} onRemove={() => removeDesign(pack.id)} />
                ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 items-start">
                <p className="text-sm text-gray-600">無料の意匠 {packs.length}件</p>
                <Button size="lg" onClick={handleCheckout} disabled={running}>
                    {running ? `取得中… ${progress.done}/${progress.total}` : `まとめて取得（${packs.length}件）`}
                </Button>
                {result && !running && (
                    <p className="text-sm text-gray-700" role="status">
                        {result.acquired.length}件取得しました
                        {result.alreadyOwned > 0 && `。取得済みが${result.alreadyOwned}件有りました`}
                        {result.failed > 0 && `。${result.failed}件は失敗しました。もう一度お試しください`}
                    </p>
                )}
            </div>
        </>
    );
}
