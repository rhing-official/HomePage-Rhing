"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NotFound from "@/app/not-found";
import { ListRowSkeleton } from "@/components/Skeleton";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import DateTimePickerDialog from "@/components/daidai-yokocho/DateTimePickerDialog";
import { parseDateKey, weekdayName } from "@/lib/calendarGrid";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import {
    approveStickerPackDeletion,
    cancelScheduledPackDeletion,
    rejectStickerPackDeletion,
} from "@/lib/firebaseFunctions";
import {
    requestNoticePreview,
    deletionStatusLabel,
    formatJstDateTime,
    formatJstSlash,
    listDeletionRequests,
    parseJstInput,
    toJstInput,
    validateDeleteAt,
    type PackDeletionRequest,
} from "@/lib/packDeletion";

const DEFAULT_NOTICE_DAYS = 7;
const SLOW_LOAD_MS = 15000; // これを超えても読み込みが終わらなければ、接続の案内を出す
const cardClass = "bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl";

type AccessState = "loading" | "denied" | "admin";

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
    const [pickingDate, setPickingDate] = useState(false);
    // 緊急: 周知の期間（24時間）を設けず、すぐに削除する（権利侵害など、待てない場合）
    const [urgent, setUrgent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const isSticker = request.kind === "sticker";
    const stickerArg = isSticker ? { stickerId: request.stickerId } : {};
    const targetLabel = isSticker ? `「${request.packName}」の「${request.stickerName}」` : `「${request.packName}」`;
    const approve = () => {
        if (urgent) {
            const preview = requestNoticePreview(request, Date.now(), true);
            if (
                !window.confirm(
                    `【緊急】承認して、${targetLabel}を、すぐに完全に削除します（お知らせを送ったあと、5分以内に削除されます）。\n入手した人（${request.ownerCount}人）に、次のお知らせが届きます。\n\n${preview}\n\n削除すると元に戻せません。よろしいですか？`,
                )
            ) {
                return;
            }
            void run(async () => {
                await approveStickerPackDeletion({ packId: request.packId, ...stickerArg, urgent: true });
            });
            return;
        }
        const at = parseJstInput(deleteAt);
        const problem = validateDeleteAt(at, new Date());
        if (problem) {
            setError(problem);
            return;
        }
        const preview = requestNoticePreview(request, at.getTime());
        if (
            !window.confirm(
                `承認して、${targetLabel}を、${formatJstDateTime(at.getTime())}に完全に削除します。\n入手した人（${request.ownerCount}人）に、次のお知らせが届きます。\n\n${preview}\n\n削除すると元に戻せません。よろしいですか？`,
            )
        ) {
            return;
        }
        void run(async () => {
            await approveStickerPackDeletion({ packId: request.packId, ...stickerArg, deleteAt: at.toISOString() });
        });
    };

    const reject = () => {
        const note = window.prompt("却下の理由（出品者に表示されます。空でも却下出来ます）", "");
        if (note === null) return;
        void run(async () => {
            await rejectStickerPackDeletion({ packId: request.packId, ...stickerArg, note });
        });
    };

    const cancel = () => {
        if (!window.confirm(`${targetLabel}の削除の予定を取り消しますか？${isSticker ? "ぺったんは残ります。" : "パックは残り、入手も再開します。"}`)) return;
        void run(async () => {
            await cancelScheduledPackDeletion({ packId: request.packId, ...stickerArg });
        });
    };

    const deleteAtParts = parseDateKey(deleteAt.slice(0, 10));
    const dateInput = (
        <div className="flex flex-col gap-1 text-xs text-gray-500">
            削除する日時（日本時間）
            <button
                type="button"
                onClick={() => setPickingDate(true)}
                disabled={urgent}
                className="self-start disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-800 text-left hover:bg-white transition-colors"
            >
                {deleteAtParts.month}月{deleteAtParts.day}日（{weekdayName(deleteAtParts.year, deleteAtParts.month, deleteAtParts.day)}）{deleteAt.slice(11, 16)}
            </button>
            <label className="flex items-start gap-2 mt-1 text-xs text-gray-700 cursor-pointer max-w-xs">
                <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="mt-0.5" />
                <span>
                    <span className="font-bold text-red-600">緊急</span>（すぐに削除する）。権利侵害等、待てない場合だけ。お知らせは送られ、5分以内に削除されます
                </span>
            </label>
            {pickingDate && (
                <DateTimePickerDialog
                    value={deleteAt}
                    onClose={() => setPickingDate(false)}
                    onSubmit={(v) => {
                        setDeleteAt(v);
                        setError(null);
                        setPickingDate(false);
                    }}
                />
            )}
        </div>
    );
    const button = "px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50";

    return (
        <li className={`${cardClass} p-5 flex flex-col gap-3`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* パック名は大きく、押しやすく（販売ページを開いて、画像を確認できる） */}
                <Link
                    href={`/daidai-yokocho/${request.packId}`}
                    className="text-xl font-bold text-gray-900 hover:text-primary underline underline-offset-4 decoration-gray-300 hover:decoration-primary transition-colors py-1"
                >
                    {request.packName || request.packId}
                    {isSticker && <span className="font-normal text-gray-600">の「{request.stickerName || request.stickerId}」</span>}
                </Link>
                <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 font-bold text-gray-600">
                    {isSticker ? "ぺったん1枚" : "パック"}
                </span>
                <span className="text-xs rounded-full bg-primary-container px-2 py-0.5 font-bold text-on-primary-container">
                    {deletionStatusLabel(request.status)}
                </span>
                <span className="text-xs text-gray-500">
                    出品者 {creator} ・ 利用者 {request.ownerCount}人
                    {request.requestedAt ? ` ・ 申請 ${formatJstSlash(request.requestedAt)}` : ""}
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
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
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
    // 何回目の読み込みまで終わったか（refreshKeyと同じなら、読み込み済み）。接続できていないのと、
    // 本当に0件なのを区別するため、終わるまでは「読み込み中」を出す
    const [loadedKey, setLoadedKey] = useState<number | null>(null);
    // 読み込みが長く終わらないとき（VPN・拡張機能・ネットワークでFirestoreに届かない等）の案内
    const [slow, setSlow] = useState(false);

    // 管理者かどうかは、ログイン中のアカウントの管理者クレーム（admin: true、DaiDaiの管理画面と同じ）で見る。
    // ここの判定は表示を切り替えるだけで、実際の権限は、Cloud Functionsとfirestore.rulesが判定する
    useEffect(
        () =>
            onAuthStateChanged(auth, (u) => {
                setUser(u);
                if (!u) {
                    setAccess("denied");
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
        const slowTimer = window.setTimeout(() => setSlow(true), SLOW_LOAD_MS);
        listDeletionRequests()
            .then(async (list) => {
                const profiles = await getCreatorProfiles(list.map((r) => r.creatorId));
                if (cancelled) return;
                setRequests(list);
                setCreators(profiles);
                setLoadError(null);
                setSlow(false);
                setLoadedKey(refreshKey);
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err instanceof Error ? err.message : "申請を読み込めませんでした");
            })
            .finally(() => window.clearTimeout(slowTimer));
        return () => {
            cancelled = true;
            window.clearTimeout(slowTimer);
        };
    }, [access, refreshKey]);

    if (access === "loading") return null;

    // 管理者でなければ（未ログイン・クレーム無し・判定の失敗も）、存在しないURLと同じ404美術館を出す。
    // 管理画面があること自体を、URLを知っただけの人に教えないため（DaiDaiの/adminと同じ）
    if (access !== "admin" || !user) return <NotFound />;

    const pending = requests.filter((r) => r.status === "pending");
    const scheduled = requests
        .filter((r) => r.status === "scheduled" || r.status === "failed")
        .sort((a, b) => (a.scheduledDeleteAt ?? 0) - (b.scheduledDeleteAt ?? 0));
    const history = requests.filter((r) => r.status === "completed" || r.status === "rejected" || r.status === "cancelled").slice(0, 50);

    const loaded = loadedKey === refreshKey;
    const count = (n: number) => (loaded ? `（${n}）` : "");
    const renderRows = (list: PackDeletionRequest[], empty: string) =>
        !loaded && list.length === 0 ? (
            <ListRowSkeleton count={2} />
        ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">{empty}</p>
        ) : (
            <ul className="flex flex-col gap-4">
                {list.map((r) => (
                    <RequestRow key={`${r.requestId}-${r.status}`} request={r} creator={creatorLabel(creators.get(r.creatorId), r.creatorId)} onChanged={reload} />
                ))}
            </ul>
        );

    return (
        <div className="container mx-auto px-6 max-w-3xl pb-24 flex flex-col gap-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wider">管理画面</h1>
                <p className="text-sm text-gray-500 mt-1">daidai横丁のパックの削除の申請を、確認して承認・却下します。</p>
            </div>
            <p className="text-xs text-gray-400 -mt-6">
                ログイン中: {user.email ?? "（メールアドレスなし）"}（{user.uid.slice(0, 8)}）
            </p>
            {loadError && <p className="text-sm text-red-600" role="alert">{loadError}</p>}
            {slow && !loaded && !loadError && (
                <p className="text-sm text-amber-700" role="status">
                    Firestoreに接続出来ていません。VPN・ブラウザの拡張機能（広告ブロッカー）・ネットワークを確認してください。
                </p>
            )}
            <Section title={`申請中${count(pending.length)}`} hint="承認すると、指定した日時に完全に削除され、入手した人には、その前にお知らせが届きます。日時は、今から24時間以上先にしてください。">
                {renderRows(pending, "申請中のパックは有りません")}
            </Section>
            <Section title={`削除予定${count(scheduled.length)}`}>{renderRows(scheduled, "削除が予定されているパックは有りません")}</Section>
            <Section title="処理済み（直近50件）">{renderRows(history, "処理済みの申請は有りません")}</Section>
        </div>
    );
}
