"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { hasOwnedGroups, requestAccountDeletion } from "@/lib/account";
import { deleteAccountImmediately } from "@/lib/firebaseFunctions";

type DeletionMode = "requested" | "immediate";

// 呼び出し元（/loginページ）が<AnimatePresence>で囲んで表示/非表示を切り替える
// 前提のダイアログ本体（Header.tsxのモバイルドロワーと同じ構成）。
export default function AccountDeleteDialog({
    uid,
    onClose,
    onDeleted,
}: {
    uid: string;
    onClose: () => void;
    onDeleted: (mode: DeletionMode) => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestDeletion = async () => {
        setError(null);
        setSubmitting(true);
        try {
            if (await hasOwnedGroups(uid)) {
                setError("長を務めている広場があります。DaiDaiアプリで長を譲渡してから削除してください。");
                return;
            }
            await requestAccountDeletion(uid);
            onDeleted("requested");
        } catch (err) {
            setError(err instanceof Error ? err.message : "処理に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImmediately = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteAccountImmediately();
            onDeleted("immediate");
        } catch (err) {
            setError(err instanceof Error ? err.message : "処理に失敗しました");
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 bg-black/20 z-[70] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/80 max-w-sm w-full p-8 flex flex-col gap-4"
            >
                <h2 className="text-lg font-bold text-gray-900">アカウントを削除しますか？</h2>

                <button
                    type="button"
                    onClick={handleRequestDeletion}
                    disabled={submitting}
                    className="w-full text-left px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <span className="block font-bold text-gray-900">30日後に削除</span>
                    <span className="block text-xs text-gray-500 mt-1">30日以内に再ログインすれば取り消せます</span>
                </button>

                <button
                    type="button"
                    onClick={handleDeleteImmediately}
                    disabled={submitting}
                    className="w-full text-left px-5 py-3 rounded-2xl border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
                >
                    <span className="block font-bold text-red-600">今すぐ削除</span>
                    <span className="block text-xs text-red-400 mt-1">この操作は取り消せません</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                >
                    やめる
                </button>

                {submitting && <p className="text-xs text-gray-400 text-center">処理中...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
            </motion.div>
        </motion.div>
    );
}
