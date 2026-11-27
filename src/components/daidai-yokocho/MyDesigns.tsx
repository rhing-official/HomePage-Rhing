"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { withdrawThemePack } from "@/lib/firebaseFunctions";
import {
    getThemePack,
    listMyThemePackSubmissions,
    loadThemePackPreview,
    submissionStatusLabel,
    type ThemePackPreviewData,
    type ThemePackSubmission,
} from "@/lib/themePackReview";
import { DesignSwatch } from "./DesignCard";

// 絞り込み（ぺったんの「作成済みのぺったん」の、公開中・下書きの絞り込みに揃える）
type StatusFilter = "all" | "waiting" | "approved" | "rejected" | "ended";
const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "全て" },
    { value: "waiting", label: "審査待ち" },
    { value: "approved", label: "公開中" },
    { value: "rejected", label: "差し戻し" },
    { value: "ended", label: "取り下げ・停止" },
];

function filterOf(status: string): StatusFilter {
    if (status === "submitted" || status === "inReview") return "waiting";
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "ended";
}

const BADGE_CLASS: Record<string, string> = {
    approved: "bg-primary text-on-primary",
    submitted: "bg-primary-container text-on-primary-container",
    inReview: "bg-primary-container text-on-primary-container",
    rejected: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
    withdrawn: "bg-surface-container-high text-on-surface-variant",
    suspended: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200",
};

function Row({ sub, canWithdraw, canUpdate, onChanged }: { sub: ThemePackSubmission; canWithdraw: boolean; canUpdate: boolean; onChanged: () => void }) {
    const [data, setData] = useState<ThemePackPreviewData | null>(null);
    const [ownerCount, setOwnerCount] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const title = sub.name ?? sub.packId.split("__").pop() ?? sub.packId;
    const published = sub.status === "approved";

    useEffect(() => {
        let cancelled = false;
        loadThemePackPreview(sub.assetPath)
            .then((d) => !cancelled && setData(d))
            .catch(() => {});
        if (published) {
            getThemePack(sub.packId)
                .then((p) => {
                    // 利用者数は、公開用の文書（themePacks）にだけ有る
                    if (!cancelled && p?.ownerCount !== undefined) setOwnerCount(p.ownerCount);
                })
                .catch(() => {});
        }
        return () => {
            cancelled = true;
        };
    }, [sub.assetPath, sub.packId, published]);

    const withdraw = async () => {
        if (!window.confirm(`『${title}』を取り下げますか？新しく取得できなくなります。取得済みの方は、使い続けられます。`)) return;
        setBusy(true);
        setError(null);
        try {
            await withdrawThemePack({ packId: sub.packId });
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "取り下げに失敗しました");
        } finally {
            setBusy(false);
        }
    };

    return (
        <li
            className={`${published ? "group relative hover:bg-surface-container-lowest/70 hover:shadow-md" : ""} flex items-center gap-4 bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-sm rounded-2xl p-4 transition-all text-left`}
        >
            <DesignSwatch data={data} className="w-16 h-16 shrink-0 rounded-xl border border-glass-edge/80 overflow-hidden [&>span]:hidden" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_CLASS[sub.status] ?? "bg-surface-container-high text-on-surface-variant"}`}>
                        {published ? "公開中" : submissionStatusLabel(sub.status)}
                    </span>
                    {published ? (
                        <Link
                            href={`/daidai-yokocho/designs/${sub.packId}`}
                            className="block min-w-0 font-bold text-on-surface truncate after:absolute after:inset-0 after:content-[''] group-hover:text-primary transition-colors"
                        >
                            {title}
                        </Link>
                    ) : (
                        <p className="min-w-0 font-bold text-on-surface truncate">{title}</p>
                    )}
                </div>
                <p className="text-xs text-on-surface-subtle mt-1">
                    無料 ・ 版{sub.version}
                    {sub.createdAt ? ` ・ ${sub.createdAt.toLocaleDateString("ja-JP")}に投稿` : ""}
                    {ownerCount !== null ? ` ・ 利用者数 ${ownerCount}` : ""}
                </p>
                {sub.status === "rejected" && sub.decisionNote && (
                    <p className="relative z-10 mt-1 text-xs font-bold text-amber-800 dark:text-amber-200 whitespace-pre-wrap break-words">差し戻しの理由: {sub.decisionNote}</p>
                )}
                {sub.status === "suspended" && sub.decisionNote && (
                    <p className="relative z-10 mt-1 text-xs font-bold text-red-700 dark:text-red-200 whitespace-pre-wrap break-words">配信停止の理由: {sub.decisionNote}</p>
                )}
                {error && <p className="relative z-10 mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
            </div>
            {canUpdate && (
                <Link
                    href={`/daidai-yokocho/creator/themes/create?from=${encodeURIComponent(sub.id)}`}
                    className="relative z-10 shrink-0 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    更新する
                </Link>
            )}
            {canWithdraw && (
                <button
                    type="button"
                    disabled={busy}
                    onClick={withdraw}
                    className="relative z-10 shrink-0 text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-800 transition-colors disabled:text-outline disabled:cursor-not-allowed"
                >
                    {busy ? "取り下げ中..." : "取り下げる"}
                </button>
            )}
        </li>
    );
}

// 自分の意匠の投稿（「作成と管理」の意匠の側）。見た目は、ぺったんの側（作成のカードと、作成済みの一覧）に揃える
export default function MyDesigns({ uid }: { uid: string }) {
    const [subs, setSubs] = useState<ThemePackSubmission[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [filter, setFilter] = useState<StatusFilter>("all");
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
    // 新しい版を作れるのは、そのidの最新の版の、公開中か差し戻しだけ（取り下げ・停止・審査待ちは除く）
    const latestVersion = new Map<string, number>();
    for (const s of subs ?? []) latestVersion.set(s.packId, Math.max(latestVersion.get(s.packId) ?? 0, s.version));
    const items = subs ?? [];
    const visible = filter === "all" ? items : items.filter((s) => filterOf(s.status) === filter);

    return (
        <div>
            {/* 投稿の入口（ぺったんの、作成のカードに当たる） */}
            <div className="bg-surface-container-lowest/40 backdrop-blur-md border border-glass-edge/80 shadow-sm rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-on-surface">意匠を投稿する</h2>
                    <p className="mt-1 text-sm text-on-surface-subtle">DaiDaiの色・形・背景を着せ替える、意匠を投稿します。公開の前に、運営が審査し、結果はお知らせに届きます。</p>
                </div>
                <div className="shrink-0 flex flex-wrap items-center gap-3">
                    <Link
                        href="/daidai-yokocho/creator/themes/create"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary tracking-wide hover:bg-primary/90 transition"
                    >
                        <PackagePlus className="w-4 h-4" aria-hidden />
                        新しく作る
                    </Link>
                    <Link
                        href="/daidai-yokocho/creator/themes/new"
                        className="inline-flex items-center gap-2 rounded-full border border-outline/50 bg-surface-container-lowest px-6 py-3 text-sm font-bold text-on-surface tracking-wide hover:border-primary transition"
                    >
                        zipを投稿する
                    </Link>
                </div>
            </div>

            {/* 投稿した意匠（状態で絞り込める） */}
            <div className="mt-16">
                <h2 className="text-xl font-bold text-on-surface mb-4">投稿した意匠</h2>

                <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="状態で絞り込む">
                    {FILTER_OPTIONS.map((o) => {
                        const count = o.value === "all" ? items.length : items.filter((s) => filterOf(s.status) === o.value).length;
                        const active = filter === o.value;
                        return (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => setFilter(o.value)}
                                aria-pressed={active}
                                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                                    active ? "bg-primary text-on-primary border-primary" : "bg-surface-container-lowest/70 text-primary border-primary/30 hover:bg-primary-container/60"
                                }`}
                            >
                                {o.label}（{count}）
                            </button>
                        );
                    })}
                </div>

                {failed ? (
                    <p className="text-sm text-red-600 dark:text-red-400">投稿を読み込めませんでした。</p>
                ) : subs === null ? (
                    <p className="text-sm text-outline">読み込み中…</p>
                ) : visible.length === 0 ? (
                    <p className="text-outline text-sm">{items.length === 0 ? "まだ意匠を投稿していません。" : "条件に一致する意匠が有りません。"}</p>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {visible.map((s) => (
                            <Row key={s.id} sub={s} canWithdraw={s.status === "approved" && latestApproved.get(s.packId) === s.version} canUpdate={(s.status === "approved" || s.status === "rejected") && latestVersion.get(s.packId) === s.version} onChanged={reload} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
