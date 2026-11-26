"use client";

import { useCallback, useEffect, useState } from "react";
import { ListRowSkeleton } from "@/components/Skeleton";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { approveThemePack, rejectThemePack, suspendThemePack } from "@/lib/firebaseFunctions";
import {
    isReviewable,
    listThemePackSubmissions,
    loadThemePackPreview,
    submissionStatusLabel,
    type ThemePackPreviewData,
    type ThemePackSubmission,
} from "@/lib/themePackReview";
import ThemePackPreview from "./ThemePackPreview";

const cardClass = "bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl";
const buttonClass = "rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed";
const MAX_REASON = 500;

function creatorLabel(profile: CreatorProfile | undefined, uid: string): string {
    return profile?.nickname ?? (profile?.rhingSeed ? `@${profile.rhingSeed}` : uid.slice(0, 8));
}

function formatDate(d: Date | null): string {
    return d ? d.toLocaleString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}

function errorMessage(err: unknown): string {
    return err instanceof Error && err.message ? err.message : "処理に失敗しました";
}

type Action = "reject" | "suspend" | null;

function SubmissionRow({ sub, creator, onChanged }: { sub: ThemePackSubmission; creator: string; onChanged: () => void }) {
    const [preview, setPreview] = useState<ThemePackPreviewData | null>(null);
    const [previewState, setPreviewState] = useState<"idle" | "loading" | "error">("idle");
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<Action>(null);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<string | null>(null);

    const toggle = async () => {
        const next = !open;
        setOpen(next);
        if (next && !preview && previewState !== "loading") {
            setPreviewState("loading");
            setPreviewError(null);
            try {
                setPreview(await loadThemePackPreview(sub.assetPath));
                setPreviewState("idle");
            } catch (err) {
                setPreviewState("error");
                setPreviewError(errorMessage(err));
            }
        }
    };

    const run = async (task: () => Promise<string>) => {
        setBusy(true);
        setError(null);
        try {
            setDone(await task());
            setAction(null);
            setReason("");
            onChanged();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const title = sub.name ?? sub.packId.split("__").pop() ?? sub.packId;
    const reasonOk = reason.trim().length > 0 && reason.trim().length <= MAX_REASON;

    const approve = () => {
        if (!window.confirm(`『${title}』（版${sub.version}）を承認して、公開します。出品者へお知らせが届きます。よろしいですか？`)) return;
        void run(async () => {
            await approveThemePack({ submissionId: sub.id });
            return "承認しました。";
        });
    };
    const submitAction = () => {
        if (!reasonOk || !action) return;
        const text =
            action === "reject"
                ? `『${title}』を差し戻します。理由は、出品者のお知らせに表示されます。よろしいですか？`
                : `『${title}』の配信を停止します。取得した人の表示は標準に戻り、お知らせが届きます。理由は出品者にだけ表示されます。よろしいですか？`;
        if (!window.confirm(text)) return;
        void run(async () => {
            if (action === "reject") {
                await rejectThemePack({ submissionId: sub.id, reason: reason.trim() });
                return "差し戻しました。";
            }
            const r = await suspendThemePack({ packId: sub.packId, reason: reason.trim() });
            return `配信を停止しました。取得した人へのお知らせ: ${r.notifiedOwners}件`;
        });
    };

    return (
        <li className={`${cardClass} p-5 flex flex-col gap-3`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-bold text-gray-900">{title}</p>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{submissionStatusLabel(sub.status)}</span>
                <span className="text-xs text-gray-500">版{sub.version}</span>
                <span className="text-xs text-gray-500">{creator}</span>
                <time className="text-xs text-gray-400">{formatDate(sub.createdAt)}</time>
            </div>
            {sub.decisionNote && <p className="text-xs text-gray-500 whitespace-pre-wrap break-words">理由: {sub.decisionNote}</p>}

            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={toggle} className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-100`}>
                    {open ? "素材を閉じる" : "素材を確認"}
                </button>
                {isReviewable(sub.status) && (
                    <>
                        <button type="button" disabled={busy} onClick={approve} className={`${buttonClass} bg-primary text-on-primary hover:bg-primary/90`}>
                            承認
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setAction(action === "reject" ? null : "reject")}
                            className={`${buttonClass} border border-amber-400 text-amber-700 hover:bg-amber-50`}
                        >
                            差し戻し
                        </button>
                    </>
                )}
                {sub.status === "approved" && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => setAction(action === "suspend" ? null : "suspend")}
                        className={`${buttonClass} border border-red-300 text-red-600 hover:bg-red-50`}
                    >
                        配信停止
                    </button>
                )}
            </div>

            {open && (
                <div className="pt-2 border-t border-gray-200/70">
                    {previewState === "loading" && <p className="text-sm text-gray-400">読み込み中…</p>}
                    {previewState === "error" && <p className="text-sm text-red-600">{previewError}</p>}
                    {preview && <ThemePackPreview data={preview} />}
                </div>
            )}

            {action && (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/70">
                    <label className="text-sm font-bold text-gray-800" htmlFor={`reason-${sub.id}`}>
                        {action === "reject" ? "差し戻しの理由（出品者のお知らせに表示されます）" : "配信停止の理由（出品者にだけ表示されます）"}
                    </label>
                    <textarea
                        id={`reason-${sub.id}`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        maxLength={MAX_REASON}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="flex items-center gap-3">
                        <button type="button" disabled={busy || !reasonOk} onClick={submitAction} className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}>
                            {action === "reject" ? "差し戻す" : "配信を停止する"}
                        </button>
                        <span className="text-xs text-gray-400">
                            {reason.trim().length}/{MAX_REASON}
                        </span>
                    </div>
                </div>
            )}

            {done && <p className="text-sm text-green-700" role="status">{done}</p>}
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </li>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-wider">{title}</h2>
            {children}
        </section>
    );
}

// 意匠パックの審査（管理画面の中の、意匠の側）。管理者かどうかの判定は、呼び出し側の管理画面が行う。
// 実際の権限は、Cloud Functionsとfirestore.rulesが判定する
export default function ThemePackReviewPanel() {
    const [subs, setSubs] = useState<ThemePackSubmission[]>([]);
    const [creators, setCreators] = useState<Map<string, CreatorProfile>>(new Map());
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loadedKey, setLoadedKey] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

    useEffect(() => {
        let cancelled = false;
        listThemePackSubmissions()
            .then(async (list) => {
                const profiles = await getCreatorProfiles(Array.from(new Set(list.map((s) => s.creatorId))));
                if (cancelled) return;
                setSubs(list);
                setCreators(profiles);
                setLoadError(null);
                setLoadedKey(refreshKey);
            })
            .catch((err) => {
                if (!cancelled) setLoadError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    const loaded = loadedKey === refreshKey;
    const waiting = subs.filter((s) => isReviewable(s.status));
    const published = subs.filter((s) => s.status === "approved" || s.status === "suspended");
    const others = subs.filter((s) => !isReviewable(s.status) && s.status !== "approved" && s.status !== "suspended");
    const count = (n: number) => (loaded ? `（${n}）` : "");
    const render = (list: ThemePackSubmission[], empty: string) =>
        !loaded && list.length === 0 ? (
            <ListRowSkeleton count={2} />
        ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">{empty}</p>
        ) : (
            <ul className="flex flex-col gap-4">
                {list.map((s) => (
                    <SubmissionRow key={`${s.id}-${s.status}`} sub={s} creator={creatorLabel(creators.get(s.creatorId), s.creatorId)} onChanged={reload} />
                ))}
            </ul>
        );

    return (
        <div className="flex flex-col gap-10">
            {loadError && <p className="text-sm text-red-600" role="alert">{loadError}</p>}
            <Section title={`審査待ち${count(waiting.length)}`}>{render(waiting, "審査待ちの投稿は有りません")}</Section>
            <Section title={`公開中・配信停止${count(published.length)}`}>{render(published, "有りません")}</Section>
            <Section title={`差し戻し・取り下げなど${count(others.length)}`}>{render(others, "有りません")}</Section>
        </div>
    );
}
