"use client";

import { useRef, useState } from "react";
import {
    deleteStickerFromPack,
    replaceStickerImage,
    requestStickerPackDeletion,
} from "@/lib/firebaseFunctions";
import { uploadStickerPackAsset } from "@/lib/firebaseStorage";
import { validateStickerImage, STICKER_ALLOWED_TYPES } from "@/lib/stickerImageSpec";
import { formatJstDateTime, validateStickerRemoval, type PackDeletionRequest } from "@/lib/packDeletion";
import type { StickerPack } from "@/lib/stickerPacks";
import DeletionRequestDialog from "@/components/daidai-yokocho/DeletionRequestDialog";

// 公開中のパックの、ぺったん1枚ごとの操作（差し替え・削除）。
// 差し替えは、運営の許可が不要（stickerIdは変わらない）。削除は、利用者がいなければ直接、
// いれば運営への申請（承認後、指定の日時に削除）。
export default function StickerRowActions({
    pack,
    sticker,
    uid,
    coverStickerId,
    request,
    onChanged,
}: {
    pack: StickerPack;
    sticker: StickerPack["stickers"][number];
    uid: string;
    coverStickerId: string | undefined;
    request: PackDeletionRequest | undefined;
    onChanged: () => void;
}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const [requesting, setRequesting] = useState(false);

    const hasUsers = pack.ownerCount > 0;
    const inProgress = request?.status === "pending" || request?.status === "scheduled" || request?.status === "failed";
    const scheduledPack = pack.deleteScheduledAt !== null;

    const handleReplace = async (file: File) => {
        setMessage(null);
        const problem = await validateStickerImage(file);
        if (problem) {
            setMessage({ text: problem, ok: false });
            return;
        }
        setBusy(true);
        try {
            const imageUrl = await uploadStickerPackAsset(uid, file);
            await replaceStickerImage({ packId: pack.id, stickerId: sticker.stickerId, imageUrl });
            setMessage({ text: "画像を差し替えました", ok: true });
            onChanged();
        } catch (err) {
            setMessage({ text: err instanceof Error ? err.message : "差し替えに失敗しました", ok: false });
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setMessage(null);
        const problem = validateStickerRemoval(
            pack.stickers.map((s) => s.stickerId),
            sticker.stickerId,
            coverStickerId,
        );
        if (problem) {
            setMessage({ text: problem, ok: false });
            return;
        }
        if (hasUsers) {
            setRequesting(true);
            return;
        }
        if (!window.confirm(`「${sticker.name}」を削除しますか？この操作は取り消せません。`)) return;
        setBusy(true);
        try {
            await deleteStickerFromPack({ packId: pack.id, stickerId: sticker.stickerId });
            onChanged();
        } catch (err) {
            setMessage({ text: err instanceof Error ? err.message : "削除に失敗しました", ok: false });
        } finally {
            setBusy(false);
        }
    };

    const statusNote =
        request?.status === "pending"
            ? "削除を申請中"
            : request?.status === "scheduled" && request.scheduledDeleteAt
              ? `${formatJstDateTime(request.scheduledDeleteAt)}に削除されます`
              : request?.status === "failed"
                ? "削除に失敗しました（運営が対応します）"
                : request?.status === "rejected"
                  ? `削除の申請は、却下されました${request.decisionNote ? `（${request.decisionNote}）` : ""}`
                  : null;

    const link = "text-[11px] font-bold transition-colors disabled:text-gray-300 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-col items-center gap-0.5 w-full">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={busy || scheduledPack}
                    className={`${link} text-primary hover:text-primary/70`}
                >
                    差し替え
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy || inProgress || scheduledPack}
                    className={`${link} text-red-600 hover:text-red-800`}
                >
                    {hasUsers ? "削除を申請" : "削除"}
                </button>
            </div>
            <input
                ref={fileInput}
                type="file"
                accept={STICKER_ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleReplace(file);
                }}
            />
            {busy && <span className="text-[10px] text-gray-400">処理中...</span>}
            {statusNote && <span className="text-[10px] text-gray-500 text-center leading-tight">{statusNote}</span>}
            {message && (
                <span className={`text-[10px] text-center leading-tight ${message.ok ? "text-emerald-700" : "text-red-600"}`} role="status">
                    {message.text}
                </span>
            )}
            {requesting && (
                <DeletionRequestDialog
                    packName={pack.name}
                    stickerName={sticker.name}
                    ownerCount={pack.ownerCount}
                    onClose={() => setRequesting(false)}
                    onSubmit={async (reason) => {
                        await requestStickerPackDeletion({ packId: pack.id, stickerId: sticker.stickerId, reason });
                        setRequesting(false);
                        setMessage({ text: "削除を申請しました", ok: true });
                        onChanged();
                    }}
                />
            )}
        </div>
    );
}
