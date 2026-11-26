// お知らせ（users/{uid}/notices）の、画面側の取り扱い。純粋な部分だけを置く（Firestoreには触れない）。
// 書き込みはサーバーだけ。形は { content, kind, createdAt, packId? }。

export const NOTICES_PAGE_SIZE = 50;

export type NoticeTone = "success" | "warning" | "danger" | "neutral";

export interface Notice {
    id: string;
    content: string;
    kind: string | null;
    packId: string | null;
    createdAt: Date | null;
}

export interface NoticeKindMeta {
    title: string;
    tone: NoticeTone;
}

const KIND_META: Record<string, NoticeKindMeta> = {
    themePackApproved: { title: "素材パックの承認", tone: "success" },
    themePackRejected: { title: "素材パックの差し戻し", tone: "warning" },
    themePackSuspended: { title: "素材パックの配信停止", tone: "danger" },
    packDeletion: { title: "パックの削除予告", tone: "warning" },
};

// 知らない種類は、見出しなしで本文だけ出す
export function noticeKindMeta(kind: string | null): NoticeKindMeta | null {
    return kind && KIND_META[kind] ? KIND_META[kind] : null;
}

// Firestoreの文書の中身から、画面用の形へ。content が文字列でなければ捨てる
export function parseNotice(
    id: string,
    data: { content?: unknown; kind?: unknown; packId?: unknown; createdAt?: unknown },
): Notice | null {
    if (typeof data.content !== "string" || data.content.trim() === "") return null;
    const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
    return {
        id,
        content: data.content,
        kind: typeof data.kind === "string" ? data.kind : null,
        packId: typeof data.packId === "string" ? data.packId : null,
        createdAt: ts && typeof ts.toDate === "function" ? ts.toDate() : null,
    };
}

// 未読数の表示。0は出さず、10件以上は「9+」
export function formatUnreadCount(count: number): string | null {
    if (!Number.isFinite(count) || count <= 0) return null;
    return count >= 10 ? "9+" : String(Math.floor(count));
}

export function isUnread(notice: Notice, readAt: Date | null): boolean {
    if (!notice.createdAt) return false;
    return !readAt || notice.createdAt.getTime() > readAt.getTime();
}

// 開発中だけの見本（?demo=1）。文面は、サーバーが書く文面と同じ形にしてある
export function demoNotices(now: Date = new Date()): Notice[] {
    const ago = (min: number) => new Date(now.getTime() - min * 60_000);
    return [
        { id: "demo-1", kind: "themePackApproved", packId: "demo", createdAt: ago(5), content: "素材パック『桜』が承認され、公開されました。" },
        { id: "demo-2", kind: "themePackRejected", packId: "demo", createdAt: ago(60 * 3), content: "素材パック『桜』は、差し戻されました。理由は次のとおりです。背景画像の権利を確認できませんでした。" },
        { id: "demo-3", kind: "themePackSuspended", packId: "demo", createdAt: ago(60 * 30), content: "取得した素材パック『桜』の配信が停止されました。表示は標準に戻ります。" },
        { id: "demo-4", kind: "packDeletion", packId: "demo", createdAt: ago(60 * 80), content: "ぺったんパック『サンプル』は、運営の対応のため削除される予定です。" },
        { id: "demo-5", kind: null, packId: null, createdAt: ago(60 * 100), content: "種類の無いお知らせの見本です。" },
    ];
}
