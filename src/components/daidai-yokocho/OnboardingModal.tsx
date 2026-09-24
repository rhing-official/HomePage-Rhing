"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { updateDaidaiProfile } from "@/lib/daidaiProfile";
import { uploadDaidaiProfileIcon } from "@/lib/firebaseStorage";

// 初回ログイン時に一度だけ表示する、daidai横丁専用の呼び名・アイコンの設定
// モーダル（DaiDai本体の身だしなみは借用しない設計への移行に伴い追加）。
// スキップも選べるが、誤操作で永久に再表示され続けないよう背景クリック・Escでの
// 暗黙クローズは行わず、必ず「スキップ」か「設定する」のどちらかを押してもらう。
export default function OnboardingModal({
    uid,
    onDone,
}: {
    uid: string;
    onDone: (next: { nickname: string | null; iconUrl: string | null }) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nickname, setNickname] = useState("");
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewUrl = useMemo(() => (iconFile ? URL.createObjectURL(iconFile) : null), [iconFile]);
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleSkip = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await updateDaidaiProfile(uid, { nickname: null, iconUrl: null });
            onDone({ nickname: null, iconUrl: null });
        } catch (err) {
            setError(err instanceof Error ? err.message : "保存に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async () => {
        setError(null);
        setSubmitting(true);
        try {
            const nicknameValue = nickname.trim() ? nickname.trim() : null;
            const iconUrl = iconFile ? await uploadDaidaiProfileIcon(uid, iconFile) : null;
            await updateDaidaiProfile(uid, { nickname: nicknameValue, iconUrl });
            onDone({ nickname: nicknameValue, iconUrl });
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
            className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/80 max-w-sm w-full p-8 flex flex-col gap-5"
            >
                <div>
                    <h2 className="text-lg font-bold text-gray-900">daidai横丁へようこそ</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        daidai横丁で表示する呼び名・アイコンを設定しましょう(あとからいつでも変更できます)。
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-white/80" />
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
                            if (file) setIconFile(file);
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    >
                        画像を選択
                    </button>
                </div>

                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    呼び名
                    <div className="relative">
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                            placeholder="未設定の場合は「名無しさん」と表示されます"
                            className="w-full rounded-lg border border-gray-200 pl-4 pr-9 py-2 bg-white/70"
                        />
                        {nickname && (
                            <button
                                type="button"
                                onClick={() => setNickname("")}
                                aria-label="呼び名をクリア"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSkip}
                        disabled={submitting}
                        className="flex-1 px-5 py-3 rounded-2xl border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        スキップ
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={submitting}
                        className="flex-1 px-5 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50"
                    >
                        {submitting ? "保存中..." : "設定する"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
