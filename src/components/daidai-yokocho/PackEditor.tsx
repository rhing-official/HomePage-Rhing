"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatPackPrice, getPackCover, type StickerPack } from "@/lib/stickerPacks";
import { getPackViewCount } from "@/lib/packStats";
import type { StickerRoleOption } from "@/lib/stickerRoles";
import { updateStickerPackMeta, addStickersToStickerPack, deleteStickerPack } from "@/lib/firebaseFunctions";
import StickerImagePicker, {
    draftEntryId,
    uploadFiles,
    type StickerDraft,
} from "@/components/daidai-yokocho/StickerImagePicker";
import {
    deletePackEditDraft,
    getPackEditDraft,
    removedImageUrls,
    resolveCoverStickerId,
    savePackEditDraft,
    type CoverChoice,
    type PackEditDraft,
} from "@/lib/packDrafts";
import { deleteStickerPackAssetByUrl } from "@/lib/firebaseStorage";

interface PackEditorProps {
    pack: StickerPack;
    uid: string;
    roleOptions: StickerRoleOption[];
    onChanged: () => void;
    onDeleted: () => void;
}

// 公開中のパックの編集。変更は「下書き保存」（公開版は変えない）か「公開する」（公開版に適用）で行う。
// 保存した編集内容（下書き）を読み込んでから、フォームを出す。
export default function PackEditor(props: PackEditorProps) {
    const { uid, pack } = props;
    const [draft, setDraft] = useState<PackEditDraft | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        getPackEditDraft(uid, pack.id).then((d) => {
            if (!cancelled) setDraft(d);
        });
        return () => {
            cancelled = true;
        };
    }, [uid, pack.id]);

    if (draft === undefined) return <p className="text-gray-400 text-sm">読み込み中...</p>;
    return <PackEditorForm key={pack.id} {...props} initialDraft={draft} />;
}

function PackEditorForm({
    pack,
    uid,
    roleOptions,
    onChanged,
    onDeleted,
    initialDraft,
}: PackEditorProps & { initialDraft: PackEditDraft | null }) {
    const defaultCoverId = getPackCover(pack)?.stickerId ?? "";
    const initialCover = (): CoverChoice => {
        const id = initialDraft?.coverStickerId;
        if (id && pack.stickers.some((st) => st.stickerId === id)) return { type: "existing", id };
        if (id && initialDraft?.addedStickers.some((st) => st.stickerId === id)) return { type: "pending", key: id };
        return { type: "existing", id: defaultCoverId };
    };

    const [name, setName] = useState(initialDraft?.name ?? pack.name);
    const [price, setPrice] = useState(String(initialDraft?.price ?? pack.price));
    const [pendingStickers, setPendingStickers] = useState<StickerDraft[]>(
        () => (initialDraft?.addedStickers ?? []).map((st) => ({ uploaded: st, roles: st.roles })),
    );
    const [cover, setCover] = useState<CoverChoice>(initialCover);

    // 保存済みの編集内容（下書き）があるか。保存した画像（保存し直したときの掃除用）
    const [hasDraft, setHasDraft] = useState(initialDraft !== null);
    const savedAdded = useRef(initialDraft?.addedStickers ?? []);
    const [busy, setBusy] = useState<"draft" | "apply" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const canDelete = pack.ownerCount === 0;

    // 閲覧回数（出品者にだけ見える。取得できなければ「-」）
    const [viewCount, setViewCount] = useState<number | null | undefined>(undefined);
    useEffect(() => {
        let cancelled = false;
        getPackViewCount(pack.id).then((n) => {
            if (!cancelled) setViewCount(n);
        });
        return () => {
            cancelled = true;
        };
    }, [pack.id]);

    const pendingCoverIndex =
        cover.type === "pending" ? pendingStickers.findIndex((e) => draftEntryId(e) === cover.key) : -1;

    // 追加予定の画像を減らして、代表に選んだ画像が無くなったら、元の代表に戻す
    const handlePendingChange = (next: StickerDraft[]) => {
        if (cover.type === "pending" && !next.some((e) => draftEntryId(e) === cover.key)) {
            setCover({ type: "existing", id: defaultCoverId });
        }
        setPendingStickers(next);
        setNotice(null);
    };

    const validate = (): { trimmedName: string; priceValue: number } | null => {
        const trimmedName = name.trim();
        const priceValue = Number(price);
        if (!trimmedName) {
            setError("パック名を入力してください");
            return null;
        }
        if (!Number.isInteger(priceValue) || priceValue < 0) {
            setError("価格は0以上の整数で入力してください");
            return null;
        }
        if (priceValue > 0 && priceValue !== pack.price) {
            setError("有料パックの出品は準備中のため、価格は0円のみ設定できます");
            return null;
        }
        return { trimmedName, priceValue };
    };

    // 追加予定の画像をアップロードし、全て「アップロード済み」にする（再アップロードしない）
    const uploadPending = async () => {
        const inputs = await uploadFiles(uid, pendingStickers);
        const coverStickerId = resolveCoverStickerId(cover, pendingStickers, inputs);
        setPendingStickers(inputs.map((st) => ({ uploaded: st, roles: st.roles })));
        if (cover.type === "pending" && coverStickerId) setCover({ type: "pending", key: coverStickerId });
        return { inputs, coverStickerId };
    };

    // 下書き保存: 編集内容を保存する。公開中のパックは、このままで、変わらない
    const handleSaveDraft = async () => {
        if (busy) return;
        setError(null);
        setNotice(null);
        const v = validate();
        if (!v) return;
        setBusy("draft");
        try {
            const { inputs, coverStickerId } = await uploadPending();
            await savePackEditDraft(uid, pack.id, {
                name: v.trimmedName,
                price: v.priceValue,
                coverStickerId: coverStickerId ?? null,
                addedStickers: inputs,
            });
            // 追加予定から外した画像は、Storageからも消す
            await Promise.all(removedImageUrls(savedAdded.current, inputs).map(deleteStickerPackAssetByUrl));
            savedAdded.current = inputs;
            setHasDraft(true);
            setNotice("編集内容を下書きとして保存しました（公開中のパックは、まだ変わっていません）");
        } catch (err) {
            setError(err instanceof Error ? err.message : "下書きの保存に失敗しました");
        } finally {
            setBusy(null);
        }
    };

    // 公開する: 編集内容を、公開中のパックに適用する
    const handleApply = async () => {
        if (busy) return;
        setError(null);
        setNotice(null);
        const v = validate();
        if (!v) return;
        setBusy("apply");
        try {
            const { inputs, coverStickerId } = await uploadPending();
            if (inputs.length > 0) {
                await addStickersToStickerPack({ packId: pack.id, stickers: inputs });
            }
            await updateStickerPackMeta({
                packId: pack.id,
                name: v.trimmedName,
                price: v.priceValue,
                ...(coverStickerId ? { coverStickerId } : {}),
            });
            // 公開できたら、編集用の下書きは不要（追加した画像は、パックが使うので消さない）
            if (hasDraft) {
                try {
                    await deletePackEditDraft(uid, pack.id, false);
                } catch {
                    // 下書きが残っても、公開は成功している
                }
            }
            setHasDraft(false);
            savedAdded.current = [];
            setPendingStickers([]);
            setCover(coverStickerId ? { type: "existing", id: coverStickerId } : { type: "existing", id: defaultCoverId });
            setNotice("編集内容を公開しました");
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "公開に失敗しました");
        } finally {
            setBusy(null);
        }
    };

    // 下書きを破棄: 保存した編集内容を消して、公開中の内容に戻す
    const handleDiscardDraft = async () => {
        if (busy) return;
        if (!window.confirm("保存した編集内容を破棄して、公開中の内容に戻しますか？追加予定の画像も削除されます。")) return;
        setError(null);
        setNotice(null);
        setBusy("draft");
        try {
            await deletePackEditDraft(uid, pack.id, true);
            savedAdded.current = [];
            setHasDraft(false);
            setPendingStickers([]);
            setName(pack.name);
            setPrice(String(pack.price));
            setCover({ type: "existing", id: defaultCoverId });
            setNotice("保存した編集内容を破棄しました");
        } catch (err) {
            setError(err instanceof Error ? err.message : "破棄に失敗しました");
        } finally {
            setBusy(null);
        }
    };

    const handleDelete = async () => {
        setDeleteError(null);
        setDeleting(true);
        try {
            await deleteStickerPack({ packId: pack.id });
            // 編集用の下書きと、追加予定の画像も、一緒に消す
            await deletePackEditDraft(uid, pack.id, true).catch(() => {});
            onDeleted();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "削除に失敗しました");
            setDeleting(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={`/daidai-yokocho/${pack.id}`}
                    className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    販売ページを見る →
                </Link>
                <span className="text-xs text-gray-400">閲覧数: {viewCount === undefined ? "…" : (viewCount ?? "-")} / 売上数: {pack.salesCount} / 利用者数: {pack.ownerCount}</span>
            </div>

            {hasDraft && (
                <p className="text-xs text-primary bg-primary-container/60 rounded-lg px-4 py-2.5">
                    保存した編集内容を読み込んでいます。「公開する」を押すまで、公開中のパックは変わりません。
                </p>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-3">
                    {pack.stickers.map((sticker, i) => {
                        const isCover = cover.type === "existing" && sticker.stickerId === cover.id;
                        return (
                            <div key={sticker.stickerId || i} className="flex flex-col items-center gap-1 w-20">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white/70">
                                    {sticker.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={sticker.imageUrl} alt={sticker.name} className="w-full h-full object-contain" />
                                    )}
                                    {/* 新規作成と同じ、★で代表を選ぶボタン（「公開する」まで、公開中のパックは変わらない） */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCover({ type: "existing", id: sticker.stickerId });
                                            setNotice(null);
                                        }}
                                        aria-pressed={isCover}
                                        aria-label={isCover ? "パックの代表（選択中）" : "パックの代表にする"}
                                        className="absolute bottom-0 left-0 bg-white/85 w-5 h-5 flex items-center justify-center"
                                    >
                                        <Star className={`w-3.5 h-3.5 ${isCover ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                                    </button>
                                </div>
                                {sticker.roles?.[0] && (
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                        {roleOptions.find((r) => r.roleId === sticker.roles?.[0])?.name ?? sticker.roles[0]}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-400">★をつけた画像が、パックの代表（一覧などに最初に出る画像）になります。</p>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                <StickerImagePicker
                    entries={pendingStickers}
                    onChange={handlePendingChange}
                    roleOptions={roleOptions}
                    label="画像を選択"
                    coverIndex={pendingCoverIndex}
                    onCoverChange={(i) => {
                        setCover({ type: "pending", key: draftEntryId(pendingStickers[i]) ?? "" });
                        setNotice(null);
                    }}
                />
                <p className="text-xs text-gray-400">
                    追加する画像は、役割を設定してから、「公開する」で公開中のパックに入ります（追加後の削除・差し替えは不可）。
                </p>
            </div>

            {/* パック名と価格は、行を分けて入力する */}
            <div className="flex flex-col gap-4 pt-3 border-t border-white/60">
                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    パック名
                    <input
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setNotice(null);
                        }}
                        className="rounded-lg border border-gray-200 px-4 py-2.5 bg-white/70 text-sm text-gray-900"
                    />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    価格（円）
                    <input
                        type="number"
                        min={0}
                        step={1}
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            setNotice(null);
                        }}
                        className="w-full sm:w-48 rounded-lg border border-gray-200 px-4 py-2.5 bg-white/70 text-sm text-gray-900"
                    />
                </label>
                <p className="text-xs text-gray-400 -mt-2">
                    現在の価格: {formatPackPrice(pack.price)}
                    {pack.price === 0 && "（有料パックの出品は準備中のため、当面は無料のみ設定できます）"}
                </p>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {notice && <p className="text-xs text-emerald-700" role="status">{notice}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={busy !== null}
                        className="rounded-full border border-primary/50 text-primary px-8 py-3 text-sm font-bold hover:bg-primary-container/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {busy === "draft" ? "保存中..." : "下書き保存"}
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={busy !== null}
                        className="rounded-full bg-primary text-on-primary px-10 py-3 text-sm font-bold tracking-wider shadow-elevation-1 hover:bg-primary/90 hover:shadow-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy === "apply" ? "公開中..." : "公開する"}
                    </button>
                </div>
                {hasDraft && (
                    <button
                        type="button"
                        onClick={handleDiscardDraft}
                        disabled={busy !== null}
                        className="self-start text-xs font-bold text-red-600 hover:text-red-800 transition-colors disabled:text-gray-300"
                    >
                        保存した編集内容を破棄する
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                {confirmingDelete ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-700">本当に削除しますか？この操作は取り消せません。</span>
                        <button
                            onClick={() => setConfirmingDelete(false)}
                            disabled={deleting}
                            className="text-sm px-4 py-1.5 rounded-full border border-primary/50 text-primary hover:bg-primary-container/60 transition disabled:opacity-50"
                        >
                            やめる
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-sm px-4 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {deleting ? "削除中..." : "削除する"}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmingDelete(true)}
                        disabled={!canDelete}
                        title={canDelete ? undefined : "現在利用しているユーザーがいるため削除できません"}
                        className="self-start text-sm font-bold text-red-600 hover:text-red-800 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                        このパックを削除する
                    </button>
                )}
                {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            </div>
        </div>
    );
}
