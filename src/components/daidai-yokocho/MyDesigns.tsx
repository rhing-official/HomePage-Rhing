"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { withdrawThemePack } from "@/lib/firebaseFunctions";
import { listMyThemePackSubmissions, submissionStatusLabel, type ThemePackSubmission } from "@/lib/themePackReview";

const STATUS_CLASS: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    inReview: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-amber-100 text-amber-800",
    withdrawn: "bg-gray-100 text-gray-600",
    suspended: "bg-red-100 text-red-700",
};

function formatDate(d: Date | null): string {
    return d ? d.toLocaleString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}

function Row({ sub, canWithdraw, onChanged }: { sub: ThemePackSubmission; canWithdraw: boolean; onChanged: () => void }) {
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const title = sub.name ?? sub.packId.split("__").pop() ?? sub.packId;

    const withdraw = async () => {
        setBusy(true);
        setError(null);
        try {
            await withdrawThemePack({ packId: sub.packId });
            setConfirming(false);
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "取り下げに失敗しました");
        } finally {
            setBusy(false);
        }
    };

    return (
        <li className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-5 flex flex-col gap-3 text-left">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {sub.status === "approved" ? (
                    <Link href={`/daidai-yokocho/designs/${sub.packId}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {title}
                    </Link>
                ) : (
                    <p className="font-bold text-gray-900">{title}</p>
                )}
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASS[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {submissionStatusLabel(sub.status)}
                </span>
                <span className="text-xs text-gray-500">版{sub.version}</span>
                <time className="text-xs text-gray-400">{formatDate(sub.createdAt)}</time>
            </div>
            {sub.status === "rejected" && sub.decisionNote && <p className="text-sm text-amber-800">差し戻しの理由: {sub.decisionNote}</p>}
            {sub.status === "suspended" && sub.decisionNote && <p className="text-sm text-red-700">配信停止の理由: {sub.decisionNote}</p>}
            {canWithdraw && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/60">
                    {confirming ? (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-gray-700">取り下げますか？ 新しく取得できなくなります。取得済みの方は、使い続けられます。</span>
                            <button type="button" disabled={busy} onClick={withdraw} className="font-bold text-red-600 hover:text-red-800 disabled:opacity-40">
                                取り下げる
                            </button>
                            <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-800">
                                やめる
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setConfirming(true)} className="self-start text-sm text-gray-500 hover:text-red-600 underline underline-offset-4">
                            取り下げる
                        </button>
                    )}
                    {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
                </div>
            )}
        </li>
    );
}

// 自分の意匠パックの投稿（「作成と管理」の意匠の側）。審査の状態・差し戻しの理由・取り下げ
export default function MyDesigns({ uid }: { uid: string }) {
    const [subs, setSubs] = useState<ThemePackSubmission[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        let cancelled = false;
        listMyThemePackSubmissions(uid)
            .then((list) => !cancelled && setSubs(list))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [uid, refreshKey]);

    // 取り下げは、公開中の最新の版だけに出す
    const latestApproved = new Map<string, number>();
    for (const s of subs ?? []) {
        if (s.status === "approved") latestApproved.set(s.packId, Math.max(latestApproved.get(s.packId) ?? 0, s.version));
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-500">DaiDaiの色・形・背景を着せ替える、意匠パックを投稿します。公開の前に、運営が審査します。結果は、お知らせに届きます。</p>
                <Link
                    href="/daidai-yokocho/creator/themes/new"
                    className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary tracking-wide hover:bg-primary/90 transition"
                >
                    意匠パックを投稿する
                </Link>
            </div>

            <h2 className="text-xl font-bold text-gray-900">投稿した意匠パック</h2>
            {failed ? (
                <p className="text-sm text-red-600">投稿を読み込めませんでした。</p>
            ) : subs === null ? (
                <p className="text-sm text-gray-400">読み込み中…</p>
            ) : subs.length === 0 ? (
                <p className="text-sm text-gray-400">まだ投稿していません。</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {subs.map((s) => (
                        <Row key={s.id} sub={s} canWithdraw={s.status === "approved" && latestApproved.get(s.packId) === s.version} onChanged={reload} />
                    ))}
                </ul>
            )}
        </div>
    );
}
