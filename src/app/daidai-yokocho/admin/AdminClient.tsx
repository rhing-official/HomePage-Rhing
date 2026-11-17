"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import ImageViewer, { type ViewerImage } from "@/components/ImageViewer";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { getStickerPackById } from "@/lib/stickerPacks";
import {
    approveStickerPackDeletion,
    cancelScheduledPackDeletion,
    rejectStickerPackDeletion,
} from "@/lib/firebaseFunctions";
import {
    DELETION_MIN_NOTICE_MS,
    deletionNoticePreview,
    deletionStatusLabel,
    formatJstDateTime,
    listDeletionRequests,
    parseJstInput,
    toJstInput,
    validateDeleteAt,
    type PackDeletionRequest,
} from "@/lib/packDeletion";

const ADMIN_PATH = "/daidai-yokocho/admin";
const DEFAULT_NOTICE_DAYS = 7;
const cardClass = "bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl";

type AccessState = "loading" | "signedOut" | "denied" | "admin";

function creatorLabel(profile: CreatorProfile | undefined, uid: string): string {
    return profile?.nickname ?? (profile?.rhingSeed ? `@${profile.rhingSeed}` : uid.slice(0, 8));
}

// 削除する日時の入力（日本時間）。既定は7日後の同じ時刻
function defaultDeleteAtInput(): string {
    return toJstInput(new Date(Date.now() + DEFAULT_NOTICE_DAYS * 24 * 60 * 60 * 1000));
}

function RequestRow({
    request,
    creator,
    onChanged,
}: {
    request: PackDeletionRequest;
    creator: string;
    onChanged: () => Promise<void>;
}) {
    const [deleteAt, setDeleteAt] = useState(defaultDeleteAtInput);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewerImages, setViewerImages] = useState<ViewerImage[] | null>(null);
    const [viewerIndex, setViewerIndex] = useState(0);

    const run = async (task: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try {
            await task();
            await onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "処理に失敗しました");
        } finally {
            setBusy(false);
        }
    };

    const openImages = () =>
        run(async () => {
            const pack = await getStickerPackById(request.packId);
            const images = (pack?.stickers ?? []).filter((s) => s.imageUrl).map((s) => ({ url: s.imageUrl, name: s.name || request.packName }));
            if (images.length === 0) throw new Error("確認できる画像がありません（すでに削除されている可能性があります）");
            setViewerIndex(0);
            setViewerImages(images);
        });

    const approve = () => {
        const at = parseJstInput(deleteAt);
        const problem = validateDeleteAt(at, new Date());
        if (problem) {
            setError(problem);
            return;
        }
        const preview = deletionNoticePreview(request.packName, at.getTime());
        if (
            !window.confirm(
                `承認して、${formatJstDateTime(at.getTime())}に完全に削除します。\n入手した人（${request.ownerCount}人）に、次のお知らせが届きます。\n\n${preview}\n\n削除すると元に戻せません。よろしいですか？`,
            )
        ) {
            return;
        }
        void run(async () => {
            await approveStickerPackDeletion({ packId: request.packId, deleteAt: at.toISOString() });
        });
    };

    const reject = () => {
        const note = window.prompt("却下の理由（出品者に表示されます。空でも却下できます）", "");
        if (note === null) return;
        void run(async () => {
            await rejectStickerPackDeletion({ packId: request.packId, note });
        });
    };

    const cancel = () => {
        if (!window.confirm(`「${request.packName}」の削除の予定を取り消しますか？パックは残り、入手も再開します。`)) return;
        void run(async () => {
            await cancelScheduledPackDeletion({ packId: request.packId });
        });
    };

    const dateInput = (
        <label className="flex flex-col gap-1 text-xs text-gray-500">
            削除する日時（日本時間）
            <input
                type="datetime-local"
                value={deleteAt}
                min={toJstInput(new Date(Date.now() + DELETION_MIN_NOTICE_MS))}
                onChange={(e) => setDeleteAt(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-800"
            />
        </label>
    );
    const button = "px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50";

    return (
        <li className={`${cardClass} p-5 flex flex-col gap-3`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link href={`/daidai-yokocho/${request.packId}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                    {request.packName || request.packId}
                </Link>
                <span className="text-xs rounded-full bg-primary-container px-2 py-0.5 font-bold text-on-primary-container">
                    {deletionStatusLabel(request.status)}
                </span>
                <span className="text-xs text-gray-500">
                    出品者 {creator} ・ 利用者 {request.ownerCount}人
                    {request.requestedAt ? ` ・ 申請 ${formatJstDateTime(request.requestedAt)}` : ""}
                </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">理由: {request.reason || "（なし）"}</p>

            {request.status === "scheduled" && request.scheduledDeleteAt && (
                <p className="text-sm font-bold text-red-600">
                    {formatJstDateTime(request.scheduledDeleteAt)}に削除されます
                    {request.noticeCount !== null ? `（お知らせ ${request.noticeCount}人）` : ""}
                </p>
            )}
            {request.noticeError && <p className="text-xs text-red-600">お知らせの送信に失敗しました: {request.noticeError}</p>}
            {request.status === "failed" && <p className="text-xs text-red-600">削除に失敗しました: {request.error}</p>}
            {request.status === "rejected" && request.decisionNote && <p className="text-xs text-gray-500">却下の理由: {request.decisionNote}</p>}
            {request.status === "completed" && request.completedAt && (
                <p className="text-xs text-gray-500">{formatJstDateTime(request.completedAt)}に削除しました</p>
            )}

            {(request.status === "pending" || request.status === "failed") && (
                <div className="flex flex-wrap items-end gap-3">
                    {dateInput}
                    <button type="button" disabled={busy} onClick={approve} className={`${button} bg-primary text-on-primary hover:bg-primary/90`}>
                        {request.status === "failed" ? "日時を決め直して承認" : "承認して、日時を指定"}
                    </button>
                    {request.status === "pending" && (
                        <button type="button" disabled={busy} onClick={reject} className={`${button} border border-gray-300 text-gray-700 hover:bg-gray-100`}>
                            却下
                        </button>
                    )}
                </div>
            )}
            {request.status === "scheduled" && (
                <div className="flex flex-wrap gap-3">
                    <button type="button" disabled={busy} onClick={cancel} className={`${button} border border-red-300 text-red-600 hover:bg-red-50`}>
                        予定を取り消す
                    </button>
                </div>
            )}
            {(request.status === "pending" || request.status === "scheduled" || request.status === "failed") && (
                <button type="button" disabled={busy} onClick={openImages} className="self-start text-xs font-bold text-primary underline underline-offset-4">
                    パックの画像を確認する
                </button>
            )}
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

            <AnimatePresence>
                {viewerImages && (
                    <ImageViewer images={viewerImages} index={viewerIndex} onIndexChange={setViewerIndex} onClose={() => setViewerImages(null)} />
                )}
            </AnimatePresence>
        </li>
    );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-wider">{title}</h2>
            {hint && <p className="text-xs text-gray-500 -mt-1">{hint}</p>}
            {children}
        </section>
    );
}

export default function AdminClient() {
    const [user, setUser] = useState<User | null>(null);
    const [access, setAccess] = useState<AccessState>("loading");
    const [requests, setRequests] = useState<PackDeletionRequest[]>([]);
    const [creators, setCreators] = useState<Map<string, CreatorProfile>>(new Map());
    const [loadError, setLoadError] = useState<string | null>(null);

    // 管理者かどうかは、ログイン中のアカウントの管理者クレーム（admin: true、DaiDaiの管理画面と同じ）で見る。
    // ここの判定は表示を切り替えるだけで、実際の権限は、Cloud Functionsとfirestore.rulesが判定する
    useEffect(
        () =>
            onAuthStateChanged(auth, (u) => {
                setUser(u);
                if (!u) {
                    setAccess("signedOut");
                    return;
                }
                u.getIdTokenResult()
                    .then((token) => setAccess(token.claims.admin === true ? "admin" : "denied"))
                    .catch(() => setAccess("denied"));
            }),
        [],
    );

    // 申請を読み込み直すときは、refreshKeyを変える（処理のあとに、一覧を最新にする）
    const [refreshKey, setRefreshKey] = useState(0);
    const reload = useCallback(async () => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        if (access !== "admin") return;
        let cancelled = false;
        listDeletionRequests()
            .then(async (list) => {
                const profiles = await getCreatorProfiles(list.map((r) => r.creatorId));
                if (cancelled) return;
                setRequests(list);
                setCreators(profiles);
                setLoadError(null);
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err instanceof Error ? err.message : "申請を読み込めませんでした");
            });
        return () => {
            cancelled = true;
        };
    }, [access, refreshKey]);

    if (access === "loading") return null;

    if (access === "signedOut") {
        return (
            <div className="container mx-auto px-6 max-w-3xl text-center text-gray-600 py-16">
                <p className="mb-4">管理画面を使うには、ログインが必要です。</p>
                <Link href={`/login?redirect=${encodeURIComponent(ADMIN_PATH)}`} className="font-bold text-primary underline underline-offset-4">
                    ログインする
                </Link>
            </div>
        );
    }

    if (access === "denied" || !user) {
        return (
            <div className="container mx-auto px-6 max-w-3xl text-center text-gray-600 py-16">
                <p className="font-bold text-gray-900 mb-2">権限がありません</p>
                <p className="text-sm">この画面は、運営の管理者だけが使えます。</p>
            </div>
        );
    }

    const pending = requests.filter((r) => r.status === "pending");
    const scheduled = requests
        .filter((r) => r.status === "scheduled" || r.status === "failed")
        .sort((a, b) => (a.scheduledDeleteAt ?? 0) - (b.scheduledDeleteAt ?? 0));
    const history = requests.filter((r) => r.status === "completed" || r.status === "rejected" || r.status === "cancelled").slice(0, 50);

    const renderRows = (list: PackDeletionRequest[], empty: string) =>
        list.length === 0 ? (
            <p className="text-sm text-gray-500">{empty}</p>
        ) : (
            <ul className="flex flex-col gap-4">
                {list.map((r) => (
                    <RequestRow key={`${r.packId}-${r.status}`} request={r} creator={creatorLabel(creators.get(r.creatorId), r.creatorId)} onChanged={reload} />
                ))}
            </ul>
        );

    return (
        <div className="container mx-auto px-6 max-w-3xl pb-24 flex flex-col gap-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wider">管理画面</h1>
                <p className="text-sm text-gray-500 mt-1">daidai横丁のパックの削除の申請を、確認して承認・却下します。</p>
            </div>
            {loadError && <p className="text-sm text-red-600" role="alert">{loadError}</p>}
            <Section title={`申請中（${pending.length}）`} hint="承認すると、指定した日時に完全に削除され、入手した人には、その前にお知らせが届きます。日時は、今から24時間以上先にしてください。">
                {renderRows(pending, "申請中のパックはありません")}
            </Section>
            <Section title={`削除予定（${scheduled.length}）`}>{renderRows(scheduled, "削除が予定されているパックはありません")}</Section>
            <Section title="処理済み（直近50件）">{renderRows(history, "処理済みの申請はありません")}</Section>
        </div>
    );
}
