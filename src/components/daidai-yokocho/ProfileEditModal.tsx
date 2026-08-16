"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { updateDaidaiProfile } from "@/lib/daidaiProfile";
import { uploadDaidaiProfileIcon } from "@/lib/firebaseStorage";

interface CurrentProfile {
    nickname: string | null;
    iconUrl: string | null;
    rhingId: string;
}

// 呼び出し元が<AnimatePresence>で囲んで表示/非表示を切り替える前提のモーダル本体
// （AccountDeleteDialog.tsxと同じ中央配置パターン）。daidai横丁専用の呼び名・
// アイコンをDaiDai本体の身だしなみとは独立して任意設定する（IDはDaiDaiと共通・
// 読み取り専用）。
export default function ProfileEditModal({
    uid,
    current,
    onClose,
    onSaved,
}: {
    uid: string;
    current: CurrentProfile;
    onClose: () => void;
    onSaved: (next: { nickname: string | null; iconUrl: string | null }) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nickname, setNickname] = useState(current.nickname ?? "");
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconCleared, setIconCleared] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewUrl = useMemo(() => (iconFile ? URL.createObjectURL(iconFile) : null), [iconFile]);
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const displayIconUrl = previewUrl ?? (iconCleared ? null : current.iconUrl);

    const handleSave = async () => {
        setError(null);
        setSubmitting(true);
        try {
            const nicknameValue = nickname.trim() ? nickname.trim() : null;
            const iconUrl = iconFile
                ? await uploadDaidaiProfileIcon(uid, iconFile)
                : iconCleared
                    ? null
                    : current.iconUrl;
            await updateDaidaiProfile(uid, { nickname: nicknameValue, iconUrl });
            onSaved({ nickname: nicknameValue, iconUrl });
        } catch (err) {
            setError(err instanceof Error ? err.message : "保存に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/80 max-w-sm w-full p-8 flex flex-col gap-5"
            >
                <h2 className="text-lg font-bold text-gray-900">プロフィールを編集</h2>

                <div className="flex flex-col items-center gap-2">
                    {displayIconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={displayIconUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-white/80" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200" />
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setIconFile(file);
                                setIconCleared(false);
                            }
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                        >
                            画像を選択
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIconFile(null);
                                setIconCleared(true);
                            }}
                            disabled={!displayIconUrl}
                            className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            クリア
                        </button>
                    </div>
                </div>

                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    呼び名
                    <div className="flex gap-2">
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                            placeholder="未設定(DaiDaiの呼び名を使用)"
                            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 bg-white/70"
                        />
                        <button
                            type="button"
                            onClick={() => setNickname("")}
                            disabled={!nickname}
                            className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            クリア
                        </button>
                    </div>
                </label>

                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    ID
                    <input
                        value={current.rhingId}
                        disabled
                        className="rounded-lg border border-gray-200 px-4 py-2 bg-gray-50 text-gray-400"
                    />
                    <span className="text-xs text-gray-400">DaiDaiと共通のため変更できません</span>
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-5 py-3 rounded-2xl border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={submitting}
                        className="flex-1 px-5 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50"
                    >
                        {submitting ? "保存中..." : "保存"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
