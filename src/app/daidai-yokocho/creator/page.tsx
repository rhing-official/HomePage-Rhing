"use client";

import { Pencil, PenTool } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import {
    getStickerPacksByCreator,
    getAllTags,
    formatPackPrice,
    getPackCover,
    type StickerPack,
} from "@/lib/stickerPacks";
import { getStickerRoles, type StickerRoleOption } from "@/lib/stickerRoles";
import { deleteStickerPack } from "@/lib/firebaseFunctions";
import CreatePackForm from "@/components/daidai-yokocho/CreatePackForm";
import { deletePackDraft, deletePackEditDraft, listPackDrafts, listPackEditDraftIds, type PackDraft } from "@/lib/packDrafts";
import { getPackViewCount } from "@/lib/packStats";

const CREATOR_PATH = "/daidai-yokocho/creator";

type StatusFilter = "all" | "pack" | "draft";
const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "全て" },
    { value: "pack", label: "公開中" },
    { value: "draft", label: "下書き" },
];
type ListItem =
    | { kind: "pack"; pack: StickerPack; at: number }
    | { kind: "draft"; draft: PackDraft; at: number };

export default function CreatorDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [loadingPacks, setLoadingPacks] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [roleOptions, setRoleOptions] = useState<StickerRoleOption[]>([]);
    // 下書き（作成の途中保存）。「編集」で、パックの編集画面へ移る
    const [drafts, setDrafts] = useState<PackDraft[]>([]);
    const [formKey, setFormKey] = useState(0);
    const formRef = useRef<HTMLDivElement>(null);
    // 作成済みのパックの絞り込み（公開中・下書き）と、公開中のパックの閲覧回数（出品者にだけ見える）
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    // 編集内容の下書きがある、公開中のパックのID（一覧のバッジ用）
    const [editDraftIds, setEditDraftIds] = useState<Set<string>>(new Set());
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewCounts, setViewCounts] = useState<Map<string, number | null>>(new Map());

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    // 未ログインならログインページに送り、処理後はこのページへ自動で戻す。
    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(CREATOR_PATH)}`);
        }
    }, [ready, user, router]);

    const reloadPacks = useCallback(async (uid: string) => {
        setLoadingPacks(true);
        try {
            setPacks(await getStickerPacksByCreator(uid));
        } finally {
            setLoadingPacks(false);
        }
    }, []);

    // 公開中のパックの閲覧回数を取得する（取得できなければ、表示は「-」）
    useEffect(() => {
        let cancelled = false;
        Promise.all(packs.map(async (p) => [p.id, await getPackViewCount(p.id)] as const)).then((entries) => {
            if (!cancelled) setViewCounts(new Map(entries));
        });
        return () => {
            cancelled = true;
        };
    }, [packs]);

    const reloadDrafts = useCallback(async (uid: string) => {
        setDrafts(await listPackDrafts(uid));
    }, []);

    useEffect(() => {
        if (!user) return;
        reloadPacks(user.uid);
        reloadDrafts(user.uid);
        listPackEditDraftIds(user.uid).then(setEditDraftIds);
    }, [user, reloadPacks, reloadDrafts]);

    useEffect(() => {
        getAllTags().then(setTagSuggestions);
    }, []);

    useEffect(() => {
        getStickerRoles().then(setRoleOptions);
    }, []);

    if (!ready || !user) return null;

    const handleDeletePack = async (pack: StickerPack) => {
        if (pack.ownerCount > 0) return;
        if (!window.confirm(`「${pack.name}」を削除しますか？画像も削除され、元に戻せません。`)) return;
        setDeletingId(pack.id);
        try {
            await deleteStickerPack({ packId: pack.id });
            // 編集内容の下書きと、追加予定の画像も、一緒に消す
            await deletePackEditDraft(user.uid, pack.id, true).catch(() => {});
            await reloadPacks(user.uid);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "削除に失敗しました");
        } finally {
            setDeletingId(null);
        }
    };

    // 公開中のパックと下書きを、更新が新しい順に、1つの一覧にする
    const items: ListItem[] = [
        ...packs.map((pack): ListItem => ({ kind: "pack", pack, at: pack.updatedAt ?? pack.createdAt ?? 0 })),
        ...drafts.map((draft): ListItem => ({ kind: "draft", draft, at: draft.updatedAt ?? 0 })),
    ].sort((x, y) => y.at - x.at);
    const visibleItems = items.filter((it) => statusFilter === "all" || it.kind === statusFilter);

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-widest text-gray-900 mb-12">
                    <PenTool className="w-7 h-7 shrink-0" aria-hidden />
                    作成と管理
                </h1>

                <div ref={formRef}>
                    <CreatePackForm
                        key={`new-${formKey}`}
                        uid={user.uid}
                        tagSuggestions={tagSuggestions}
                        roleOptions={roleOptions}
                        draft={null}
                        draftCount={drafts.length}
                        onDraftsChanged={() => reloadDrafts(user.uid)}
                        onCreated={() => {
                            // 公開したら、空のフォームに戻す
                            setFormKey((k) => k + 1);
                            reloadPacks(user.uid);
                            reloadDrafts(user.uid);
                        }}
                    />
                </div>

                {/* 作成済みのパック（公開中と下書きを、絞り込める） */}
                <div className="mt-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">作成済みのパック</h2>

                    <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="公開中・下書きで絞り込む">
                        {STATUS_FILTER_OPTIONS.map((o) => {
                            const count = o.value === "all" ? items.length : items.filter((it) => it.kind === o.value).length;
                            const active = statusFilter === o.value;
                            return (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => setStatusFilter(o.value)}
                                    aria-pressed={active}
                                    className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                        active
                                            ? "bg-primary text-on-primary border-primary"
                                            : "bg-white/70 text-primary border-primary/30 hover:bg-primary-container/60"
                                    }`}
                                >
                                    {o.label}（{count}）
                                </button>
                            );
                        })}
                    </div>

                    {loadingPacks ? (
                        <p className="text-gray-400 text-sm">読み込み中...</p>
                    ) : visibleItems.length === 0 ? (
                        <p className="text-gray-400 text-sm">
                            {items.length === 0 ? "まだパックを作成していません。" : "条件に一致するパックがありません。"}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {visibleItems.map((item) =>
                                item.kind === "pack" ? (
                                    // 公開中: 行のどこを押しても販売ページへ移る（「編集」ボタンだけは、編集画面へ）
                                    <div
                                        key={`pack-${item.pack.id}`}
                                        className="group relative flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-4 hover:bg-white/70 hover:shadow-md transition-all"
                                    >
                                        <div className="w-16 h-16 shrink-0 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                                            {getPackCover(item.pack)?.imageUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={getPackCover(item.pack)!.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
                                                    公開中
                                                </span>
                                                <Link
                                                    href={`/daidai-yokocho/${item.pack.id}`}
                                                    className="block min-w-0 font-bold text-gray-900 truncate after:absolute after:inset-0 after:content-[''] group-hover:text-primary transition-colors"
                                                >
                                                    {item.pack.name}
                                                </Link>
                                            </div>
                                            {editDraftIds.has(item.pack.id) && (
                                                <span className="relative z-10 mt-1 inline-block rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary-container">
                                                    編集中の下書きあり
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatPackPrice(item.pack.price)} ・ 閲覧回数 {viewCounts.get(item.pack.id) ?? "-"} ・ 利用者数 {item.pack.ownerCount}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/daidai-yokocho/creator/edit/${item.pack.id}`}
                                            className="relative z-10 shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-4 py-2 text-sm font-bold text-primary hover:bg-primary-container/60 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" aria-hidden />
                                            編集
                                        </Link>
                                        {/* 利用しているユーザーがいるパックは削除できないので、グレーアウトする */}
                                        <button
                                            type="button"
                                            disabled={item.pack.ownerCount > 0 || deletingId === item.pack.id}
                                            title={item.pack.ownerCount > 0 ? "現在利用しているユーザーがいるため削除できません" : undefined}
                                            onClick={() => handleDeletePack(item.pack)}
                                            className="relative z-10 shrink-0 text-sm font-bold text-red-600 hover:text-red-800 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:text-gray-300"
                                        >
                                            {deletingId === item.pack.id ? "削除中..." : "削除"}
                                        </button>
                                    </div>
                                ) : (
                    
                                    <div
                                        key={`draft-${item.draft.id}`}
                                        className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-dashed border-primary/40 shadow-sm rounded-2xl p-4"
                                    >
                                        <div className="w-16 h-16 shrink-0 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                                            {(item.draft.stickers.find((st) => st.stickerId === item.draft.coverStickerId) ?? item.draft.stickers[0])?.imageUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={(item.draft.stickers.find((st) => st.stickerId === item.draft.coverStickerId) ?? item.draft.stickers[0]).imageUrl}
                                                    alt=""
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-gray-900 truncate">
                                                <span className="mr-2 inline-block rounded-full border border-dashed border-primary/60 bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary-container align-middle">
                                                    下書き
                                                </span>
                                                {item.draft.name || "無題の下書き"}
                                            </p>
                                            {/* 未公開のパックは、価格だけを出す（作成時は、無料のみ） */}
                                            <p className="text-xs text-gray-500 mt-1">{formatPackPrice(0)}</p>
                                        </div>
                                        <Link
                                            href={`/daidai-yokocho/creator/drafts/${item.draft.id}`}
                                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-4 py-2 text-sm font-bold text-primary hover:bg-primary-container/60 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" aria-hidden />
                                            編集
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!window.confirm("この下書きを削除しますか？画像も削除され、元に戻せません。")) return;
                                                await deletePackDraft(user.uid, item.draft, true);
                                                reloadDrafts(user.uid);
                                            }}
                                            className="shrink-0 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            削除
                                        </button>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
