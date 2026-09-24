"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";

// DaiDai本体（lib/features/auth/passkey_sign_in_dialog.dart）と同じ文言・
// フローのWeb版。ProfileEditModal.tsxと同じ中央配置のガラス調モーダル。
export default function PasskeySignInDialog({
    onClose,
    onSignedIn,
}: {
    onClose: () => void;
    onSignedIn: () => void;
}) {
    const [rhingSeed, setRhingSeed] = useState("");
    const { submitting, error, signInWithPasskey } = usePasskeyAuth();

    const handleSubmit = async () => {
        const seed = rhingSeed.trim().toLowerCase().replace(/^@+/, "");
        if (!seed) return;
        try {
            await signInWithPasskey(seed);
            onSignedIn();
        } catch {
            // エラーメッセージはusePasskeyAuthのerrorに反映済み
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
                <h2 className="text-lg font-bold text-gray-900">パスキーでログイン</h2>
                <p className="text-sm text-gray-600">登録済みのRhing Seedを入力してください。</p>

                <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                    Rhing Seed
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                        <input
                            value={rhingSeed}
                            onChange={(e) => setRhingSeed(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !submitting) handleSubmit();
                            }}
                            className="w-full rounded-lg border border-gray-200 pl-8 pr-4 py-2 bg-white/70"
                        />
                    </div>
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
                        onClick={handleSubmit}
                        disabled={submitting || !rhingSeed.trim()}
                        className="flex-1 px-5 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50"
                    >
                        {submitting ? "ログイン中..." : "ログイン"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
