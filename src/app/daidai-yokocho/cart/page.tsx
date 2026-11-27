"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { getStickerPackById, isPackOwnedByUser, type StickerPack } from "@/lib/stickerPacks";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { checkoutCart, removeFromCart } from "@/lib/cart";
import { acquireThemePack } from "@/lib/firebaseFunctions";
import { checkoutDesignCart, loadDesignList } from "@/lib/designLists";
import { itemKey, mergeByAddedAt, parseItemKey, type MixedItem } from "@/lib/mixedList";
import type { PublicThemePack } from "@/lib/themePackReview";
import Button from "@/components/ui/Button";
import { PackGridSkeleton } from "@/components/Skeleton";
import StickerPackCard from "@/components/StickerPackCard";
import DesignCard from "@/components/daidai-yokocho/DesignCard";
import { SelectableItem, SelectionToolbar, useSelection } from "@/components/daidai-yokocho/Selection";
import FindInYokochoLink from "@/components/daidai-yokocho/FindInYokochoLink";
import KindBadge from "@/components/daidai-yokocho/KindBadge";

const CART_PATH = "/daidai-yokocho/cart";

type CartEntry = StickerPack | PublicThemePack;

interface CheckoutSummary {
    acquired: number;
    alreadyOwned: number;
    failed: number;
}

// ぺったんと意匠を、1つの一覧にまとめたカート。追加した新しい順に並べる
export default function CartPage() {
    const router = useRouter();
    const { user, authReady, cartReady, designCartReady, ids, designIds, addedAt, designAddedAt, remove, removeDesign } = useCart();
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [designs, setDesigns] = useState<PublicThemePack[]>([]);
    const [petanLoading, setPetanLoading] = useState(true);
    const [designLoading, setDesignLoading] = useState(true);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [result, setResult] = useState<CheckoutSummary | null>(null);
    const sel = useSelection();
    const [removingSelected, setRemovingSelected] = useState(false);
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile>>(new Map());

    useEffect(() => {
        if (authReady && !user) router.replace(`/login?redirect=${encodeURIComponent(CART_PATH)}`);
    }, [authReady, user, router]);

    // カートの中身（ID）が変わるたびに、ぺったんの詳細を取り直す。入手済み・削除済みのぺったんはカートから外す
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
                setPetanLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, cartReady, idsKey]);

    // 意匠も同じ。取得済み・存在しない・取り下げの意匠はカートから外し、配信停止は消さずに隠す
    const designIdsKey = useMemo(() => Array.from(designIds).sort().join(","), [designIds]);
    useEffect(() => {
        if (!user || !designCartReady) return;
        let cancelled = false;
        loadDesignList(user.uid, "cartDesigns", designIdsKey ? designIdsKey.split(",") : []).then((list) => {
            if (cancelled) return;
            setDesigns(list);
            setDesignLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [user, designCartReady, designIdsKey]);

    // 追加した新しい順に、1つの一覧にする
    const items = useMemo<MixedItem<CartEntry>[]>(
        () =>
            mergeByAddedAt<CartEntry>(
                packs.map((p) => ({ kind: "petan", id: p.id, addedAt: addedAt.get(p.id) ?? 0, data: p })),
                designs.map((p) => ({ kind: "design", id: p.id, addedAt: designAddedAt.get(p.id) ?? 0, data: p })),
            ),
        [packs, designs, addedAt, designAddedAt],
    );

    // カードに出す、クリエイターの情報
    const creatorKey = useMemo(() => Array.from(new Set(items.map((i) => (i.data as { creatorId: string }).creatorId))).sort().join(","), [items]);
    useEffect(() => {
        if (!creatorKey) return;
        let cancelled = false;
        getCreatorProfiles(creatorKey.split(","))
            .then((m) => !cancelled && setCreatorProfiles(m))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [creatorKey]);

    if (!authReady || !user) return null;

    const free = packs.filter((p) => p.price === 0);
    const paid = packs.length - free.length;
    // 意匠は全て無料
    const acquirable = free.length + designs.length;
    const running = progress !== null;
    const loading = petanLoading || designLoading;

    // 選んだものを、まとめてカートから外す
    const handleRemoveSelected = async (keys: string[]) => {
        if (!window.confirm(`${keys.length}件をカートから外します。よろしいですか？`)) return;
        setRemovingSelected(true);
        try {
            await Promise.all(
                keys.map((k) => {
                    const { kind, id } = parseItemKey(k);
                    return kind === "petan" ? remove(id) : removeDesign(id);
                }),
            );
            sel.clear();
        } finally {
            setRemovingSelected(false);
        }
    };

    // 無料のぺったんと、意匠を、順に入手する（Cloud Functionsへの同時リクエストを避ける）
    const handleCheckout = async () => {
        if (acquirable === 0) return;
        if (!window.confirm(`${acquirable}件を入手します。よろしいですか？`)) return;
        setResult(null);
        setProgress({ done: 0, total: acquirable });
        const summary: CheckoutSummary = { acquired: 0, alreadyOwned: 0, failed: 0 };
        try {
            if (free.length > 0) {
                const r = await checkoutCart(packs, user.uid, (done) => setProgress({ done, total: acquirable }));
                summary.acquired += r.acquired.length;
                summary.alreadyOwned += r.alreadyOwned;
                summary.failed += r.failed;
            }
            if (designs.length > 0) {
                const base = free.length;
                const r = await checkoutDesignCart(
                    user.uid,
                    designs.map((d) => d.id),
                    (id) => acquireThemePack({ packId: id }),
                    (done) => setProgress({ done: base + done, total: acquirable }),
                );
                summary.acquired += r.acquired.length;
                summary.alreadyOwned += r.alreadyOwned;
                summary.failed += r.failed;
            }
            setResult(summary);
            sel.clear();
        } finally {
            setProgress(null);
        }
    };

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-widest text-on-surface mb-12">
                    <ShoppingCart className="w-7 h-7 shrink-0" aria-hidden />
                    カート
                </h1>

                {loading ? (
                    <PackGridSkeleton count={3} />
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-start gap-4">
                        {result ? (
                            <p className="text-sm text-on-surface-variant" role="status">
                                {result.acquired}件入手しました
                                {result.failed > 0 && `。${result.failed}件は失敗しました。もう一度お試しください`}
                                。
                                <Link href="/daidai-yokocho/owned" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                                    購入済みを見る →
                                </Link>
                            </p>
                        ) : (
                            <p className="text-outline text-sm">カートは空です。</p>
                        )}
                        <FindInYokochoLink />
                    </div>
                ) : (
                    <>
                        <SelectionToolbar
                            ids={items.map((i) => itemKey(i.kind, i.id))}
                            selected={sel.selected}
                            busy={running || removingSelected}
                            actionLabel="カートから外す"
                            onSelectAll={sel.selectAll}
                            onClear={sel.clear}
                            onAction={handleRemoveSelected}
                            trailing={
                                <Button onClick={handleCheckout} disabled={running || acquirable === 0}>
                                    {running ? `入手中… ${progress!.done}/${progress!.total}` : `まとめて入手（${acquirable}件）`}
                                </Button>
                            }
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((item) => {
                                const key = itemKey(item.kind, item.id);
                                const pack = item.data as StickerPack & PublicThemePack;
                                return (
                                    <SelectableItem
                                        key={key}
                                        selected={sel.selected.has(key)}
                                        onToggle={() => sel.toggle(key)}
                                        label={pack.name}
                                        badge={<KindBadge kind={item.kind} />}
                                    >
                                        {item.kind === "petan" ? (
                                            <StickerPackCard pack={pack} creator={creatorProfiles.get(pack.creatorId) ?? null} />
                                        ) : (
                                            <DesignCard pack={pack} creator={creatorProfiles.get(pack.creatorId) ?? null} />
                                        )}
                                    </SelectableItem>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 items-start">
                            {paid > 0 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    有料のぺったん{paid}件は、現在購入出来ません。カートには残ります。
                                </p>
                            )}
                            {result && !running && (
                                <p className="text-sm text-on-surface-variant" role="status">
                                    {result.acquired}件入手しました
                                    {result.alreadyOwned > 0 && `。入手済みが${result.alreadyOwned}件有りました`}
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
