import { describe, expect, it } from "vitest";
import { months } from "@/data/financialData";
import { demoFinancialYears, monthExpense, monthIncome } from "@/lib/financial";

describe("demoFinancialYears", () => {
    const years = demoFinancialYears();

    it("2017年度から2026年度までの10年分を持つ", () => {
        expect(Object.keys(years).sort()).toEqual(Array.from({ length: 10 }, (_, k) => `${2017 + k}年度`));
    });

    it("全ての年度が、12か月分のキーを持つ", () => {
        for (const data of Object.values(years)) {
            expect(Object.keys(data)).toEqual(months);
        }
    });

    it("月ごとの収入は正の数で、支出は数値になる", () => {
        for (const data of Object.values(years)) {
            for (const m of months) {
                const income = monthIncome(data[m]);
                const expense = monthExpense(data[m]);
                expect(typeof income).toBe("number");
                expect(typeof expense).toBe("number");
                expect(income as number).toBeGreaterThan(0);
            }
        }
    });

    it("隣り合う年度の線の形が違う（切り替えで、はっきり変形する）", () => {
        const incomes = (key: string) => months.map((m) => monthIncome(years[key][m]) as number);
        for (let y = 2017; y < 2026; y++) {
            expect(incomes(`${y}年度`)).not.toEqual(incomes(`${y + 1}年度`));
        }
    });

    it("2025年度は右肩上がり、2026年度は山なり", () => {
        const incomes = (key: string) => months.map((m) => monthIncome(years[key][m]) as number);
        const a = incomes("2025年度");
        const b = incomes("2026年度");
        const avg = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length;
        // 2025年度は右肩上がり: 終わりの3か月の平均が、始まりの3か月より大きい
        expect(avg(a.slice(9))).toBeGreaterThan(avg(a.slice(0, 3)));
        // 2026年度は山なり: 最大が、年の真ん中の付近に有る
        const peak = b.indexOf(Math.max(...b));
        expect(peak).toBeGreaterThanOrEqual(3);
        expect(peak).toBeLessThanOrEqual(8);
    });
});
