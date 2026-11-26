import { describe, expect, it } from "vitest";
import { demoNotices, formatNoticeContent, formatUnreadCount, isUnread, noticeKindMeta, parseNotice } from "./notices";

describe("formatUnreadCount", () => {
    it("0以下は出さない", () => {
        expect(formatUnreadCount(0)).toBeNull();
        expect(formatUnreadCount(-1)).toBeNull();
        expect(formatUnreadCount(NaN)).toBeNull();
    });
    it("9件までは数字、10件以上は9+", () => {
        expect(formatUnreadCount(1)).toBe("1");
        expect(formatUnreadCount(9)).toBe("9");
        expect(formatUnreadCount(10)).toBe("9+");
        expect(formatUnreadCount(120)).toBe("9+");
    });
});

describe("parseNotice", () => {
    const ts = (d: Date) => ({ toDate: () => d });
    it("正常な文書", () => {
        const d = new Date("2026-11-26T00:00:00Z");
        expect(parseNotice("a", { content: "本文", kind: "themePackApproved", packId: "p", createdAt: ts(d) })).toEqual({
            id: "a", content: "本文", kind: "themePackApproved", packId: "p", createdAt: d,
        });
    });
    it("contentが無い・空は捨てる", () => {
        expect(parseNotice("a", {})).toBeNull();
        expect(parseNotice("a", { content: "  " })).toBeNull();
        expect(parseNotice("a", { content: 1 })).toBeNull();
    });
    it("kind・packId・createdAtが無くても読める", () => {
        expect(parseNotice("a", { content: "x" })).toEqual({ id: "a", content: "x", kind: null, packId: null, createdAt: null });
    });
});

describe("noticeKindMeta", () => {
    it("既知の種類は見出しを返し、未知はnull", () => {
        expect(noticeKindMeta("themePackRejected")?.tone).toBe("warning");
        expect(noticeKindMeta("unknown")).toBeNull();
        expect(noticeKindMeta(null)).toBeNull();
    });
});

describe("isUnread", () => {
    const n = demoNotices(new Date("2026-11-26T12:00:00Z"))[0];
    it("既読時刻が無ければ未読", () => expect(isUnread(n, null)).toBe(true));
    it("既読時刻より新しければ未読", () => expect(isUnread(n, new Date("2026-11-26T00:00:00Z"))).toBe(true));
    it("既読時刻より古ければ既読", () => expect(isUnread(n, new Date("2026-11-27T00:00:00Z"))).toBe(false));
    it("日時が無ければ未読にしない", () => expect(isUnread({ ...n, createdAt: null }, null)).toBe(false));
});

describe("formatNoticeContent", () => {
    it("「理由は次のとおりです。」の後ろで改行する", () => {
        expect(formatNoticeContent("意匠パック『桜』は、差し戻されました。理由は次のとおりです。背景が不明です。")).toBe(
            "意匠パック『桜』は、差し戻されました。理由は次のとおりです。\n背景が不明です。",
        );
    });
    it("すでに改行が有れば、重ねない", () => {
        const text = "理由は次のとおりです。\n背景が不明です。";
        expect(formatNoticeContent(text)).toBe(text);
    });
    it("理由の中の改行は、そのまま残す", () => {
        expect(formatNoticeContent("理由は次のとおりです。一行目\n二行目")).toBe("理由は次のとおりです。\n一行目\n二行目");
    });
    it("理由の文が無い・別の文面は、変えない", () => {
        expect(formatNoticeContent("意匠パック『桜』が承認され、公開されました。")).toBe("意匠パック『桜』が承認され、公開されました。");
        expect(formatNoticeContent("理由は次のとおりです。")).toBe("理由は次のとおりです。");
    });
});
