"use client";

import { Heart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getFavoritedStickerEntries, removeFavoritePack } from "@/lib/favorites";
import { addManyDesignsToCart, getDesignListEntries, loadDesignList, removeFromDesignList } from "@/lib/designLists";
import { addManyToCart } from "@/lib/cart";
import { useCart } from "@/components/CartProvider";
import Button from "@/components/ui/Button";
import { itemKey, mergeByAddedAt, parseItemKey, type MixedItem } from "@/lib/mixedList";
import type { StickerPack } from "@/lib/stickerPacks";
import type { PublicThemePack } from "@/lib/themePackReview";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import StickerPackCard from "@/components/StickerPackCard";
import DesignCard from "@/components/daidai-yokocho/DesignCard";
import KindBadge from "@/components/daidai-yokocho/KindBadge";
import FindInYokochoLink from "@/components/daidai-yokocho/FindInYokochoLink";
import { SelectableItem, SelectionToolbar, useSelection } from "@/components/daidai-yokocho/Selection";
import { PackGridSkeleton } from "@/components/Skeleton";

const FAVORITES_PATH = "/daidai-yokocho/favorites";

type FavoriteEntry = StickerPack | PublicThemePack;

// ぺったんと意匠を、1つの一覧にまとめたお気に入り。追加した新しい順に並べる
export default function FavoritesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [items, setItems] = useState<MixedItem<FavoriteEntry>[]>([]);
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile>>(new Map());
    const [loading, setLoading] = useState(false);
    const sel = useSelection();
    const [removing, setRemoving] = useState(false);
    const { ids: cartIds, designIds: cartDesignIds } = useCart();
    const [adding, setAdding] = useState(false);
    const [cartResult, setCartResult] = useState<{ added: number; skipped: number; failed: boolean } | null>(null);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(FAVORITES_PATH)}`);
        }
    }, [ready, user, router]);

    const reload = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            // 意匠は、存在しない・取り下げのものを、読み込みの時にお気に入りから消す。配信停止は、消さずに隠す
            const [petan, designEntries] = await Promise.all([getFavoritedStickerEntries(uid), getDesignListEntries(uid, "favoriteDesigns")]);
            const designs = await loadDesignList(uid, "favoriteDesigns", designEntries.map((e) => e.id));
            const designAddedAt = new Map(designEntries.map((e) => [e.id, e.addedAt]));
            setItems(
                mergeByAddedAt<FavoriteEntry>(
                    petan.map((e) => ({ kind: "petan", id: e.pack.id, addedAt: e.addedAt, data: e.pack })),
                    designs.map((p) => ({ kind: "design", id: p.id, addedAt: designAddedAt.get(p.id) ?? 0, data: p })),
                ),
            );
            setCreatorProfiles(
                await getCreatorProfiles([...petan.map((e) => e.pack.creatorId), ...designs.map((p) => p.creatorId)]).catch(() => new Map<string, CreatorProfile>()),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) reload(user.uid);
    }, [user, reload]);

    const keys = useMemo(() => items.map((i) => itemKey(i.kind, i.id)), [items]);

    if (!ready || !user) return null;

    // 選んだものを、まとめてお気に入りから外す。成功した分だけ一覧から消す
    const handleRemoveSelected = async (selectedKeys: string[]) => {
        if (!window.confirm(`${selectedKeys.length}件をお気に入りから外します。よろしいですか？`)) return;
        setRemoving(true);
        try {
            const results = await Promise.allSettled(
                selectedKeys.map((k) => {
                    const { kind, id } = parseItemKey(k);
                    return kind === "petan" ? removeFavoritePack(user.uid, id) : removeFromDesignList(user.uid, "favoriteDesigns", id);
                }),
            );
            const removed = new Set(selectedKeys.filter((_, i) => results[i].status === "fulfilled"));
            setItems((prev) => prev.filter((i) => !removed.has(itemKey(i.kind, i.id))));
            if (removed.size === selectedKeys.length) sel.clear();
        } finally {
            setRemoving(false);
        }
    };

    // 選んだものを、まとめてカートに追加する。入手済み・カート済みは除き、上限（50件）を超えた分は入れない
    const handleAddToCart = async (selectedKeys: string[]) => {
        const chosen = new Set(selectedKeys);
        const chosenItems = items.filter((i) => chosen.has(itemKey(i.kind, i.id)));
        const petan = chosenItems.filter((i) => i.kind === "petan").map((i) => i.data as StickerPack);
        const designs = chosenItems.filter((i) => i.kind === "design").map((i) => i.data as PublicThemePack);
        setAdding(true);
        setCartResult(null);
        try {
            const [p, d] = await Promise.all([
                petan.length > 0 ? addManyToCart(petan, user.uid, cartIds) : null,
                designs.length > 0 ? addManyDesignsToCart(designs, user.uid, cartDesignIds) : null,
            ]);
            const added = (p?.added ?? 0) + (d?.added ?? 0);
            setCartResult({ added, skipped: selectedKeys.length - added, failed: false });
            sel.clear();
        } catch {
            setCartResult({ added: 0, skipped: 0, failed: true });
        } finally {
            setAdding(false);
        }
    };

    const selectedCount = keys.filter((k) => sel.selected.has(k)).length;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-widest text-on-surface mb-12">
                    <Heart className="w-7 h-7 shrink-0" aria-hidden />
                    お気に入り
                </h1>

                {loading ? (
                    <PackGridSkeleton count={3} />
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-start gap-4">
                        <p className="text-outline text-sm">まだお気に入りが有りません。</p>
                        <FindInYokochoLink />
                    </div>
                ) : (
                    <>
                        <SelectionToolbar
                            ids={keys}
                            selected={sel.selected}
                            busy={removing}
                            actionLabel="お気に入りから外す"
                            onSelectAll={sel.selectAll}
                            onClear={sel.clear}
                            onAction={handleRemoveSelected}
                            trailing={
                                <Button variant="tonal" onClick={() => handleAddToCart(keys.filter((k) => sel.selected.has(k)))} disabled={removing || adding || selectedCount === 0}>
                                    {adding ? "追加中…" : `カートに追加（${selectedCount}件）`}
                                </Button>
                            }
                        />
                        {cartResult && !adding && (
                            <p className="-mt-3 mb-6 text-sm text-on-surface-variant" role="status">
                                {cartResult.failed ? (
                                    "カートに追加出来ませんでした。時間をおいてお試しください。"
                                ) : (
                                    <>
                                        {cartResult.added}件をカートに追加しました
                                        {cartResult.skipped > 0 && `。入手済み・カート済み・上限の為、${cartResult.skipped}件は追加していません`}
                                        {" "}
                                        <Link href="/daidai-yokocho/cart" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            カートを見る →
                                        </Link>
                                    </>
                                )}
                            </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((item) => {
                                const key = itemKey(item.kind, item.id);
                                const name = (item.data as { name: string }).name;
                                return (
                                    <SelectableItem
                                        key={key}
                                        selected={sel.selected.has(key)}
                                        onToggle={() => sel.toggle(key)}
                                        label={name}
                                        badge={<KindBadge kind={item.kind} />}
                                    >
                                        {item.kind === "petan" ? (
                                            <StickerPackCard pack={item.data as StickerPack} creator={creatorProfiles.get((item.data as StickerPack).creatorId) ?? null} />
                                        ) : (
                                            <DesignCard pack={item.data as PublicThemePack} creator={creatorProfiles.get((item.data as PublicThemePack).creatorId) ?? null} />
                                        )}
                                    </SelectableItem>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
