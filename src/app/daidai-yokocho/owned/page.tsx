"use client";

import { PackageCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getOwnedStickerEntries, type StickerPack } from "@/lib/stickerPacks";
import { listOwnedThemePackEntries, type PublicThemePack } from "@/lib/themePackReview";
import { uninstallStickerPack, uninstallThemePack } from "@/lib/firebaseFunctions";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { itemKey, mergeByAddedAt, parseItemKey, type MixedItem } from "@/lib/mixedList";
import StickerPackCard from "@/components/StickerPackCard";
import DesignCard from "@/components/daidai-yokocho/DesignCard";
import KindBadge from "@/components/daidai-yokocho/KindBadge";
import KindFilter, { type KindFilterValue } from "@/components/daidai-yokocho/KindFilter";
import FindInYokochoLink from "@/components/daidai-yokocho/FindInYokochoLink";
import ConfirmDialog from "@/components/daidai-yokocho/ConfirmDialog";
import { SelectableItem, SelectionToolbar, useSelection } from "@/components/daidai-yokocho/Selection";
import { PackGridSkeleton } from "@/components/Skeleton";

const OWNED_PATH = "/daidai-yokocho/owned";

type OwnedEntry = StickerPack | PublicThemePack;

// 取り下げ・配信停止になった意匠は、取得済みでも、そのことを示す
const STATUS_NOTE: Record<string, { label: string; className: string }> = {
    withdrawn: { label: "取り下げ", className: "bg-gray-100 text-gray-600" },
    suspended: { label: "配信停止", className: "bg-red-100 text-red-700" },
};

// ぺったんと意匠を、1つの一覧にまとめた購入済み。取得した新しい順に並べる。増えても見つけやすいよう、種別で絞れる
export default function OwnedPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [items, setItems] = useState<MixedItem<OwnedEntry>[]>([]);
    const [creatorProfiles, setCreatorProfiles] = useState<Map<string, CreatorProfile>>(new Map());
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [filter, setFilter] = useState<KindFilterValue>("all");
    const sel = useSelection();
    const [confirming, setConfirming] = useState<string[] | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    // 未ログインならログインページに送り、処理後はこのページへ自動で戻す。
    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(OWNED_PATH)}`);
        }
    }, [ready, user, router]);

    const reload = useCallback(async (uid: string) => {
        setLoading(true);
        setFailed(false);
        try {
            const [petan, designs] = await Promise.all([getOwnedStickerEntries(uid), listOwnedThemePackEntries(uid)]);
            setItems(
                mergeByAddedAt<OwnedEntry>(
                    petan.map((e) => ({ kind: "petan", id: e.pack.id, addedAt: e.addedAt, data: e.pack })),
                    designs.map((e) => ({ kind: "design", id: e.pack.id, addedAt: e.addedAt, data: e.pack })),
                ),
            );
            setCreatorProfiles(
                await getCreatorProfiles([...petan.map((e) => e.pack.creatorId), ...designs.map((e) => e.pack.creatorId)]).catch(() => new Map<string, CreatorProfile>()),
            );
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) reload(user.uid);
    }, [user, reload]);

    const counts = useMemo<Record<KindFilterValue, number>>(
        () => ({
            all: items.length,
            petan: items.filter((i) => i.kind === "petan").length,
            design: items.filter((i) => i.kind === "design").length,
        }),
        [items],
    );
    const shown = useMemo(() => (filter === "all" ? items : items.filter((i) => i.kind === filter)), [items, filter]);
    const keys = useMemo(() => shown.map((i) => itemKey(i.kind, i.id)), [shown]);

    if (!ready || !user) return null;

    // 選んだものを、まとめてアンインストールする。成功した分だけ一覧から消し、失敗した分は残す
    const handleUninstall = async () => {
        if (!confirming) return;
        setBusy(true);
        setError(null);
        const results = await Promise.allSettled(
            confirming.map((k) => {
                const { kind, id } = parseItemKey(k);
                return kind === "petan" ? uninstallStickerPack({ packId: id }) : uninstallThemePack({ packId: id });
            }),
        );
        const removed = new Set(confirming.filter((_, i) => results[i].status === "fulfilled"));
        setItems((prev) => prev.filter((i) => !removed.has(itemKey(i.kind, i.id))));
        const failedCount = confirming.length - removed.size;
        setBusy(false);
        if (failedCount === 0) {
            setConfirming(null);
            sel.clear();
        } else {
            setConfirming(confirming.filter((k) => !removed.has(k)));
            setError(`${failedCount}件はアンインストールに失敗しました。もう一度お試しください。`);
        }
    };

    const hasPetan = !!confirming?.some((k) => parseItemKey(k).kind === "petan");
    const hasDesign = !!confirming?.some((k) => parseItemKey(k).kind === "design");
    const message = [
        "本当にアンインストールしますか？",
        hasPetan ? "ぺったんは、送信できなくなります。" : "",
        hasDesign ? "意匠は、着せ替えが標準に戻ります。" : "",
    ].join("");

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-widest text-gray-900 mb-12">
                    <PackageCheck className="w-7 h-7 shrink-0" aria-hidden />
                    購入済み
                </h1>

                {loading ? (
                    <PackGridSkeleton count={3} />
                ) : failed ? (
                    <p className="text-sm text-red-600">購入済みを読み込めませんでした。時間をおいて、もう一度お試しください。</p>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-start gap-4">
                        <p className="text-gray-400 text-sm">まだ購入済みが有りません。</p>
                        <FindInYokochoLink />
                    </div>
                ) : (
                    <>
                        <KindFilter value={filter} counts={counts} onChange={setFilter} />
                        <SelectionToolbar
                            ids={keys}
                            selected={sel.selected}
                            busy={busy}
                            actionLabel="アンインストール"
                            onSelectAll={sel.selectAll}
                            onClear={sel.clear}
                            onAction={(selectedKeys) => {
                                setError(null);
                                setConfirming(selectedKeys);
                            }}
                        />
                        {shown.length === 0 ? (
                            <p className="text-gray-400 text-sm">この種別の購入済みは、まだ有りません。</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {shown.map((item) => {
                                    const key = itemKey(item.kind, item.id);
                                    const pack = item.data as StickerPack & PublicThemePack;
                                    const note = item.kind === "design" && pack.status ? STATUS_NOTE[pack.status] : undefined;
                                    return (
                                        <SelectableItem
                                            key={key}
                                            selected={sel.selected.has(key)}
                                            onToggle={() => sel.toggle(key)}
                                            label={pack.name}
                                            badge={
                                                // 種別で絞っている間は、種別のバッジを出さない（全て同じ種別の為）。取り下げ・配信停止の印は、常に出す
                                                filter === "all" || note ? (
                                                    <span className="flex items-center gap-1.5">
                                                        {filter === "all" && <KindBadge kind={item.kind} />}
                                                        {note && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${note.className}`}>{note.label}</span>}
                                                    </span>
                                                ) : undefined
                                            }
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
                        )}
                    </>
                )}
            </div>

            {confirming && (
                <ConfirmDialog
                    title={`${confirming.length}件をアンインストール`}
                    message={message}
                    confirmLabel="アンインストール"
                    busyLabel="アンインストール中..."
                    busy={busy}
                    error={error}
                    onConfirm={handleUninstall}
                    onClose={() => setConfirming(null)}
                />
            )}
        </div>
    );
}
