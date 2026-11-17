"use client";

import { useState } from "react";
import { DELETION_TEXT_MAX, validateDeletionReason } from "@/lib/packDeletion";

// 利用者のいるパックの削除を、運営へ申請する。理由（必須・200文字まで）を入力して送る
export default function DeletionRequestDialog({
    packName,
    stickerName,
    ownerCount,
    onSubmit,
    onClose,
}: {
    packName: string;
    // ぺったん1枚の削除のときだけ渡す
    stickerName?: string;
    ownerCount: number;
    onSubmit: (reason: string) => Promise<void>;
    onClose: () => void;
}) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const problem = validateDeletionReason(reason);
        if (problem) {
            setError(problem);
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await onSubmit(reason.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : "申請に失敗しました");
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="削除の申請">
            <div className="w-full max-w-md bg-white rounded-m3-xl shadow-elevation-3 p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-gray-900">
                    {stickerName ? `「${packName}」の「${stickerName}」の削除を申請` : `「${packName}」の削除を申請`}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {stickerName ? "このパックは" : "このぺったんは"}、{ownerCount}人が利用しているため、直接は削除できません。運営が確認して、承認されると、運営が決めた日時に削除されます。利用している人には、削除の前にお知らせが届きます。
                </p>
                <label className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-700">削除の理由（必須）</span>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={DELETION_TEXT_MAX}
                        rows={4}
                        className="w-full rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        placeholder="例: 誤って出品したため"
                    />
                    <span className="text-xs text-gray-400 text-right">{reason.length} / {DELETION_TEXT_MAX}</span>
                </label>
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
                        やめる
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting} className="px-5 py-2 rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {submitting ? "送信中..." : "申請する"}
                    </button>
                </div>
            </div>
        </div>
    );
}
