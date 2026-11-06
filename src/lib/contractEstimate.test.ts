import { describe, expect, it } from "vitest";
import { estimateApp, estimateWeb } from "./contractEstimate";

describe("estimateWeb", () => {
    it("1ページ・2ページ・4ページの金額と期間", () => {
        expect(estimateWeb({ pages: 1, branchingForm: false, membership: false })).toMatchObject({ total: 27_500, days: 14 });
        expect(estimateWeb({ pages: 2, branchingForm: false, membership: false })).toMatchObject({ total: 44_000, days: 30 });
        expect(estimateWeb({ pages: 4, branchingForm: false, membership: false })).toMatchObject({ total: 44_000, days: 30 });
    });
    it("5ページ以上は1ページごとに+10,000円・+5日", () => {
        expect(estimateWeb({ pages: 5, branchingForm: false, membership: false })).toMatchObject({ total: 54_000, days: 35 });
        expect(estimateWeb({ pages: 20, branchingForm: false, membership: false })).toMatchObject({ total: 204_000, days: 110, needsConsult: false });
    });
    it("21ページ以上は要相談", () => {
        expect(estimateWeb({ pages: 21, branchingForm: false, membership: false }).needsConsult).toBe(true);
    });
    it("条件分岐フォームは+22,000円（4ページで66,000円）", () => {
        expect(estimateWeb({ pages: 4, branchingForm: true, membership: false }).total).toBe(66_000);
    });
    it("会員機能は+55,000円・+10日", () => {
        expect(estimateWeb({ pages: 4, branchingForm: false, membership: true })).toMatchObject({ total: 99_000, days: 40 });
        expect(estimateWeb({ pages: 4, branchingForm: true, membership: true }).total).toBe(121_000);
    });
    it("0以下のページ数は1ページとして扱う", () => {
        expect(estimateWeb({ pages: 0, branchingForm: false, membership: false }).total).toBe(27_500);
    });
});

describe("estimateApp", () => {
    const base = { screens: 3, storeSupport: false, membership: false };
    it("Webだけは画面3つまで100,000円、Androidを含むと画面5つまで200,000円", () => {
        expect(estimateApp({ ...base, platforms: ["web"] })).toMatchObject({ total: 100_000, days: 30 });
        expect(estimateApp({ ...base, platforms: ["web", "android"], screens: 5 })).toMatchObject({ total: 200_000, days: 45 });
        expect(estimateApp({ ...base, platforms: ["android"], screens: 5 })).toMatchObject({ total: 200_000 });
    });
    it("含まれる画面数を超えた分だけ、1画面ごとに+20,000円・+5日", () => {
        expect(estimateApp({ ...base, platforms: ["web"], screens: 4 })).toMatchObject({ total: 120_000, days: 35 });
        expect(estimateApp({ ...base, platforms: ["android"], screens: 6 })).toMatchObject({ total: 220_000, days: 50 });
    });
    it("ストア公開サポートは、Androidを含むときだけ+30,000円", () => {
        expect(estimateApp({ ...base, platforms: ["web"], storeSupport: true }).total).toBe(100_000);
        expect(estimateApp({ ...base, platforms: ["android"], screens: 5, storeSupport: true }).total).toBe(230_000);
    });
    it("会員機能は、Webだけのとき+50,000円・+10日。Androidを含むときは最初から含まれる", () => {
        expect(estimateApp({ ...base, platforms: ["web"], membership: true })).toMatchObject({ total: 150_000, days: 40 });
        expect(estimateApp({ ...base, platforms: ["web", "android"], screens: 5, membership: true })).toMatchObject({ total: 200_000, days: 45 });
    });
    it("iOS・macOS・Windows・Linuxは合計に入れず、注意書きに出す", () => {
        const e = estimateApp({ ...base, platforms: ["web", "ios", "windows"] });
        expect(e.total).toBe(100_000);
        expect(e.needsConsult).toBe(false);
        expect(e.notes.join("")).toContain("iOS・Windows");
    });
    it("Web・Android以外だけを選ぶと、個別のご相談になる", () => {
        expect(estimateApp({ ...base, platforms: ["linux"] }).needsConsult).toBe(true);
    });
    it("21画面以上は要相談", () => {
        expect(estimateApp({ ...base, platforms: ["web"], screens: 21 }).needsConsult).toBe(true);
    });
});
