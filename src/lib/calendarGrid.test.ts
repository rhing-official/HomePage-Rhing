import { describe, expect, it } from "vitest";
import { addDays, dateKey, daysInMonth, monthCells, shiftMonth, weekdayLabels, weekdayName } from "./calendarGrid";

describe("monthCells", () => {
    it("マスの数は7の倍数で、当月の日が全て入る", () => {
        for (const [y, m] of [[2026, 11], [2026, 2], [2024, 2], [2026, 3], [2027, 5]]) {
            const cells = monthCells(y, m);
            expect(cells.length % 7).toBe(0);
            expect(cells.filter((c) => c.inMonth).length).toBe(daysInMonth(y, m));
        }
    });
    it("2026年11月1日は日曜。日曜始まりなら先頭、月曜始まりなら7番目", () => {
        expect(monthCells(2026, 11, "sunday")[0]).toEqual({ year: 2026, month: 11, day: 1, inMonth: true });
        const monday = monthCells(2026, 11, "monday");
        expect(monday[0]).toEqual({ year: 2026, month: 10, day: 26, inMonth: false });
        expect(monday[6]).toEqual({ year: 2026, month: 11, day: 1, inMonth: true });
    });
    it("前後の月の余白は、inMonthがfalse", () => {
        const cells = monthCells(2026, 12, "sunday"); // 12/1は火曜
        expect(cells[0]).toEqual({ year: 2026, month: 11, day: 29, inMonth: false });
        expect(cells[cells.length - 1].inMonth).toBe(false);
    });
});

describe("日付の計算", () => {
    it("うるう年の2月", () => {
        expect(daysInMonth(2024, 2)).toBe(29);
        expect(daysInMonth(2026, 2)).toBe(28);
    });
    it("addDays: 月・年をまたぐ", () => {
        expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
        expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
        expect(addDays("2026-11-17", 7)).toBe("2026-11-24");
    });
    it("shiftMonth: 年をまたぐ", () => {
        expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
        expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    });
    it("曜日の見出しと曜日名、日付のキー", () => {
        expect(weekdayLabels("sunday")[0]).toBe("日");
        expect(weekdayLabels("monday")[0]).toBe("月");
        expect(weekdayLabels("monday")[6]).toBe("日");
        expect(weekdayName(2026, 11, 17)).toBe("火");
        expect(dateKey(2026, 3, 5)).toBe("2026-03-05");
    });
});
