"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePasskeyAuth, type PasskeyRecoveryQuestions } from "@/hooks/usePasskeyAuth";

// DaiDai本体（lib/features/auth/passkey_recovery_dialog.dart）と同じ文言・
// 2段階フロー（Rhing Seed→秘密の質問）のWeb版。「新しいパスキーを登録
// しますか？」の復旧後オファーは対象外（addPasskeyCredential用の別callable
// が必要で、ログイン画面ではなく設定画面寄りの機能のため）。
export default function PasskeyRecoveryDialog({
    onClose,
    onRecovered,
}: {
    onClose: () => void;
    onRecovered: () => void;
}) {
    const [rhingSeed, setRhingSeed] = useState("");
    const [questions, setQuestions] = useState<PasskeyRecoveryQuestions | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);
    const { submitting, error, setError, beginRecovery, submitRecoveryAnswers } = usePasskeyAuth();

    const handleNext = async () => {
        const seed = rhingSeed.trim().toLowerCase().replace(/^@+/, "");
        if (!seed) return;
        const result = await beginRecovery(seed);
        if (result) {
            setQuestions(result);
            setAnswers(result.questions.map(() => ""));
        }
    };

    const handleSubmit = async () => {
        if (!questions) return;
        if (answers.some((a) => !a.trim())) {
            setError("すべての質問に回答してください。");
            return;
        }
        const ok = await submitRecoveryAnswers(questions.recoveryId, answers);
        if (ok) onRecovered();
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
                <h2 className="text-lg font-bold text-gray-900">アカウントの復旧</h2>

                {!questions ? (
                    <>
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
                                        if (e.key === "Enter" && !submitting) handleNext();
                                    }}
                                    className="w-full rounded-lg border border-gray-200 pl-8 pr-4 py-2 bg-white/70"
                                />
                            </div>
                        </label>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-600">以下の質問に回答してください。</p>
                        {questions.questions.map((q, i) => (
                            <label key={i} className="flex flex-col gap-1.5 text-sm text-gray-600">
                                {q}
                                <input
                                    type="password"
                                    value={answers[i] ?? ""}
                                    onChange={(e) =>
                                        setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                                    }
                                    autoFocus={i === 0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !submitting) handleSubmit();
                                    }}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-white/70"
                                />
                            </label>
                        ))}
                    </>
                )}

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
                        onClick={questions ? handleSubmit : handleNext}
                        disabled={submitting || (questions ? answers.some((a) => !a.trim()) : !rhingSeed.trim())}
                        className="flex-1 px-5 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition disabled:opacity-50"
                    >
                        {submitting ? "処理中..." : questions ? "復旧する" : "次へ"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
