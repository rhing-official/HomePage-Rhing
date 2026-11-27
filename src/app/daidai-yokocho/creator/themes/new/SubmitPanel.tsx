"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import type { User } from "@/lib/firebaseAuth";
import { submitThemePack } from "@/lib/firebaseFunctions";
import { uploadThemePackSubmission } from "@/lib/firebaseStorage";
import type { ValidationResult } from "@/lib/themePack/validate";

// TODO: 権利の表明と、投稿の規約の文面は、仮のもの。専門家の確認が済んだら、公開の前に差し替える（2026-11-26、意匠の方針）。
const RIGHTS_STATEMENT =
    "投稿する素材は、自分で作ったものであるか、投稿に必要な許諾を得たものです。素材の著作権は、投稿者が持ちます。DaiDaiには、配信と表示のための許諾だけを渡します。";

/** 権利の表明、規約への同意、送信。zipを選ぶ投稿画面と、作成画面で共有する */
export default function SubmitPanel({ user, result, onSubmitted }: { user: User; result: ValidationResult | null | undefined; onSubmitted?: () => void }) {
    const [rights, setRights] = useState(false);
    const [terms, setTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const canSubmit = !!result?.ok && !!result.files && rights && terms && !submitting && !submitted;

    // 検査に通った素材を、本人の保存先へ置き、提出する。サーバーが、もう一度検査する
    const submit = async () => {
        if (!canSubmit || !result?.files) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const submissionId = crypto.randomUUID();
            await uploadThemePackSubmission(user.uid, submissionId, result.files);
            await submitThemePack({ submissionId, rightsAccepted: true });
            setSubmitted(true);
            onSubmitted?.();
        } catch (err) {
            console.error("意匠を送信できませんでした:", err);
            setSubmitError(
                err instanceof FirebaseError && err.code === "functions/resource-exhausted"
                    ? "投稿できる数の上限に達しています。"
                    : "送信できませんでした。時間をおいて、もう一度お試しください。",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <section className="mt-10 flex flex-col gap-4 rounded-m3-lg bg-surface-container-lowest border border-outline-variant shadow-sm p-6">
                <h2 className="font-bold text-on-surface">投稿する前に</h2>
                <label className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed cursor-pointer">
                    <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
                    <span>{RIGHTS_STATEMENT}</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed cursor-pointer">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
                    <span>
                        <Link href="/legal/terms" className="underline underline-offset-2 hover:text-on-surface" target="_blank">
                            利用規約
                        </Link>
                        に同意します。
                    </span>
                </label>
                <p className="text-xs text-outline leading-relaxed">この文面は、仮のものです。公開の前に、専門家の確認を受けて差し替えます。</p>
            </section>

            <div className="mt-8 flex flex-col items-start gap-3">
                <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? "送信中…" : submitted ? "提出しました" : "投稿する"}
                </button>
                {submitted ? (
                    <p className="text-sm text-green-700 dark:text-green-200 leading-relaxed">提出しました。運営が審査し、結果はお知らせでお伝えします。</p>
                ) : submitError ? (
                    <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">{submitError}</p>
                ) : (
                    <p className="text-sm text-on-surface-subtle leading-relaxed">
                        {canSubmit
                            ? "確認と同意は、済んでいます。送ると、運営の審査に進みます。"
                            : "確認に通り、2つの同意にチェックを入れると、送れるようになります。"}
                    </p>
                )}
            </div>
        </>
    );
}
