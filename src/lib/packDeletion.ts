import { collection, getDocs, limit, orderBy, query, Timestamp, where, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 出品済みパックの削除の申請（2026-11-17）。利用者のいる（ownerCount > 0）パックは、出品者が運営へ
// 申請し、運営（管理者）が日時を指定して承認する。承認後は、その時刻に自動で完全に削除される。
// 申請は packDeletionRequests/{packId}（書き込みはCloud Functionsのみ、DaiDaiリポジトリのfirestore.rules参照）。

export type PackDeletionStatus = "pending" | "scheduled" | "completed" | "rejected" | "cancelled" | "failed";

export interface PackDeletionRequest {
    packId: string;
    packName: string;
    creatorId: string;
    reason: string;
    ownerCount: number;
    status: PackDeletionStatus;
    requestedAt: number | null;
    scheduledDeleteAt: number | null;
    decidedAt: number | null;
    decisionNote: string;
    completedAt: number | null;
    error: string;
    noticeCount: number | null;
    noticeError: string;
}

// DaiDaiリポジトリ functions/src/packDeletion.ts と同じ値
export const DELETION_TEXT_MAX = 200;
export const DELETION_MIN_NOTICE_MS = 24 * 60 * 60 * 1000;

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function validateDeletionReason(value: string): string | null {
    const text = value.trim();
    if (text === "") return "削除の理由を入力してください";
    if (text.length > DELETION_TEXT_MAX) return `削除の理由は${DELETION_TEXT_MAX}文字以内にしてください`;
    return null;
}

// 削除する日時の検査（今から24時間以上先）。問題が無ければnull
export function validateDeleteAt(date: Date, now: Date): string | null {
    if (Number.isNaN(date.getTime())) return "削除する日時を指定してください";
    if (date.getTime() - now.getTime() < DELETION_MIN_NOTICE_MS) {
        return "削除する日時は、今から24時間以上先にしてください（利用者へ知らせる期間のため）";
    }
    return null;
}

// <input type="datetime-local">の値（"2026-11-24T12:30"）を、日本時間として解釈した日時にする
export function parseJstInput(value: string): Date {
    return new Date(`${value}:00+09:00`);
}

// 日時を、<input type="datetime-local">の値（日本時間、"2026-11-24T12:30"）にする
export function toJstInput(date: Date): string {
    const shifted = new Date(date.getTime() + JST_OFFSET_MS);
    return shifted.toISOString().slice(0, 16);
}

// 日本時間の「何月何日何時（何分）」。分が0なら省く（Cloud Functionsの定型文と同じ）
export function formatJstDateTime(ms: number): string {
    const j = new Date(ms + JST_OFFSET_MS);
    const minute = j.getUTCMinutes();
    const time = minute === 0 ? `${j.getUTCHours()}時` : `${j.getUTCHours()}時${minute}分`;
    return `${j.getUTCMonth() + 1}月${j.getUTCDate()}日${time}`;
}

// 入手した人へ送られるお知らせの文面（Cloud Functionsの packDeletionNoticeText と同じ。確認用のプレビュー）
export function deletionNoticePreview(packName: string, deleteAtMs: number): string {
    return `「${packName}」というぺったんをお使いの利用者の方に連絡します。${formatJstDateTime(deleteAtMs)}に使えなくなります。`;
}

export function deletionStatusLabel(status: PackDeletionStatus): string {
    switch (status) {
        case "pending":
            return "申請中";
        case "scheduled":
            return "削除予定";
        case "completed":
            return "削除済み";
        case "rejected":
            return "却下";
        case "cancelled":
            return "取り消し";
        case "failed":
            return "削除に失敗";
    }
}

const STATUSES: PackDeletionStatus[] = ["pending", "scheduled", "completed", "rejected", "cancelled", "failed"];

function millis(value: unknown): number | null {
    return value instanceof Timestamp ? value.toMillis() : null;
}

export function toDeletionRequest(id: string, data: DocumentData): PackDeletionRequest {
    const status = STATUSES.includes(data.status) ? (data.status as PackDeletionStatus) : "pending";
    return {
        packId: typeof data.packId === "string" ? data.packId : id,
        packName: typeof data.packName === "string" ? data.packName : "",
        creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
        reason: typeof data.reason === "string" ? data.reason : "",
        ownerCount: typeof data.ownerCount === "number" ? data.ownerCount : 0,
        status,
        requestedAt: millis(data.requestedAt),
        scheduledDeleteAt: millis(data.scheduledDeleteAt),
        decidedAt: millis(data.decidedAt),
        decisionNote: typeof data.decisionNote === "string" ? data.decisionNote : "",
        completedAt: millis(data.completedAt),
        error: typeof data.error === "string" ? data.error : "",
        noticeCount: typeof data.noticeCount === "number" ? data.noticeCount : null,
        noticeError: typeof data.noticeError === "string" ? data.noticeError : "",
    };
}

// 自分（出品者）の削除の申請。読めない（ルール未デプロイ等）ときは空にして、画面を止めない
export async function getMyDeletionRequests(creatorId: string): Promise<Map<string, PackDeletionRequest>> {
    try {
        const snapshot = await getDocs(query(collection(db, "packDeletionRequests"), where("creatorId", "==", creatorId)));
        return new Map(snapshot.docs.map((d) => [d.id, toDeletionRequest(d.id, d.data())]));
    } catch {
        return new Map();
    }
}

// 管理画面用: 全ての削除の申請（新しい申請順、最大200件）。管理者だけが読める
export async function listDeletionRequests(): Promise<PackDeletionRequest[]> {
    const snapshot = await getDocs(query(collection(db, "packDeletionRequests"), orderBy("requestedAt", "desc"), limit(200)));
    return snapshot.docs.map((d) => toDeletionRequest(d.id, d.data()));
}
