import { describe, expect, it } from "vitest";
import {
    DELETION_MIN_NOTICE_MS,
    deletionNoticePreview,
    deletionRequestId,
    requestNoticePreview,
    validateStickerRemoval,
    deletionStatusLabel,
    formatJstDateTime,
    parseJstInput,
    toDeletionRequest,
    toJstInput,
    validateDeleteAt,
    validateDeletionReason,
} from "./packDeletion";

const NOW = new Date("2026-11-17T00:00:00.000Z");

describe("validateDeletionReason", () => {
    it("空・空白だけは拒否、200文字を超えると拒否、前後の空白は無視して通す", () => {
        expect(validateDeletionReason("")).not.toBeNull();
        expect(validateDeletionReason("   ")).not.toBeNull();
        expect(validateDeletionReason("a".repeat(201))).not.toBeNull();
        expect(validateDeletionReason("a".repeat(200))).toBeNull();
        expect(validateDeletionReason("  誤って出品しました ")).toBeNull();
    });
});

describe("validateDeleteAt", () => {
    it("今から24時間以上先だけ通る（ちょうど24時間は通る）", () => {
        expect(validateDeleteAt(new Date(NOW.getTime() + DELETION_MIN_NOTICE_MS), NOW)).toBeNull();
        expect(validateDeleteAt(new Date(NOW.getTime() + DELETION_MIN_NOTICE_MS - 1), NOW)).not.toBeNull();
        expect(validateDeleteAt(new Date(NOW.getTime() - 1000), NOW)).not.toBeNull();
    });
    it("不正な日時は拒否", () => {
        expect(validateDeleteAt(new Date("あした"), NOW)).not.toBeNull();
    });
});

describe("日本時間の入力・表示", () => {
    it("datetime-localの値を、日本時間として解釈する", () => {
        expect(parseJstInput("2026-11-24T12:30").toISOString()).toBe("2026-11-24T03:30:00.000Z");
    });
    it("日時を、日本時間のdatetime-localの値にする（日付をまたぐ場合も）", () => {
        expect(toJstInput(new Date("2026-11-24T03:30:00.000Z"))).toBe("2026-11-24T12:30");
        expect(toJstInput(new Date("2026-12-31T15:00:00.000Z"))).toBe("2027-01-01T00:00");
    });
    it("表示は、分が0なら省く（Cloud Functionsの定型文と同じ）", () => {
        expect(formatJstDateTime(new Date("2026-11-24T03:00:00.000Z").getTime())).toBe("11月24日12時");
        expect(formatJstDateTime(new Date("2026-11-24T03:30:00.000Z").getTime())).toBe("11月24日12時30分");
        expect(formatJstDateTime(new Date("2026-12-31T15:00:00.000Z").getTime())).toBe("1月1日0時");
    });
    it("お知らせのプレビューは、Cloud Functionsの定型文と同じ", () => {
        expect(deletionNoticePreview("おめでとうパック", new Date("2026-11-24T03:00:00.000Z").getTime())).toBe(
            "「おめでとうパック」というぺったんをお使いの利用者の方に連絡します。11月24日12時に使えなくなります。",
        );
    });
});

describe("toDeletionRequest / deletionStatusLabel", () => {
    it("足りない項目は既定値にそろえ、知らない状態は申請中にする", () => {
        const r = toDeletionRequest("p1", { status: "???", reason: "x" });
        expect(r).toMatchObject({ packId: "p1", status: "pending", reason: "x", scheduledDeleteAt: null, noticeCount: null });
    });
    it("状態の文言", () => {
        expect(deletionStatusLabel("pending")).toBe("申請中");
        expect(deletionStatusLabel("scheduled")).toBe("削除予定");
        expect(deletionStatusLabel("failed")).toBe("削除に失敗");
    });
});

describe("ぺったん1枚の削除", () => {
    it("申請の文書ID", () => {
        expect(deletionRequestId("p1")).toBe("p1");
        expect(deletionRequestId("p1", "s1")).toBe("p1__s1");
    });
    it("下限・代表・存在しないIDを拒否する", () => {
        const ids = ["a", "b", "c", "d", "e"];
        expect(validateStickerRemoval(ids, "e", "a")).toBeNull();
        expect(validateStickerRemoval(ids, "x", "a")).not.toBeNull();
        expect(validateStickerRemoval(ids, "a", "a")).not.toBeNull();
        expect(validateStickerRemoval(["a", "b", "c", "d"], "d", "a")).not.toBeNull();
    });
    it("お知らせの文面は、種別で変わる（サーバーと同じ）", () => {
        const ms = new Date("2026-12-01T03:00:00.000Z").getTime();
        expect(requestNoticePreview({ kind: "sticker", packName: "春のパック", stickerName: "ねこ" }, ms)).toBe(
            "「春のパック」というぺったんパックの中の「ねこ」をお使いの利用者の方に連絡します。12月1日12時に使えなくなります。",
        );
        expect(requestNoticePreview({ kind: "pack", packName: "春のパック", stickerName: "" }, ms)).toBe(
            "「春のパック」というぺったんをお使いの利用者の方に連絡します。12月1日12時に使えなくなります。",
        );
    });
});
