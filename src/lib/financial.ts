import { allYearData, type Amount, type ExpenseDetail, type IncomeDetail, type MonthData, type YearData } from "@/data/financialData";

// 収支データを取得する。今は静的データを返すだけ。将来、Stripeや
// クラウドの請求データなどから自動で取得する場合は、この関数の中身を差し替える。
export async function getFinancialData(): Promise<Record<string, YearData>> {
    return allYearData;
}

// 数値だけを合計する。全て "-" のときは "-"
export function sumAmounts(values: Amount[]): Amount {
    const numbers = values.filter((v): v is number => v !== "-");
    if (numbers.length === 0) return "-";
    return numbers.reduce((a, b) => a + b, 0);
}

export const monthIncome = (m: MonthData): Amount => sumAmounts(Object.values(m.incomeDetail satisfies IncomeDetail));
export const monthExpense = (m: MonthData): Amount => sumAmounts(Object.values(m.expenseDetail satisfies ExpenseDetail));

// 収入 - 支出。どちらかが "-" のときは "-"
export function netProfit(income: Amount, expense: Amount): Amount {
    if (income === "-" || expense === "-") return "-";
    return income - expense;
}

// 前の年度のキー（例: "2026年度" → "2025年度"）
export function prevYearKey(year: string): string {
    const n = parseInt(year, 10);
    return Number.isNaN(n) ? "" : `${n - 1}年度`;
}

// 金額を「¥ -」または「¥1,200,000」の形式で表示する
export function formatCurrency(amount: Amount): string {
    if (amount === "-") return "¥ -";
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
}

// 前年比（%）。前年が "-" や 0 のときは null
export function calculateRatio(current: Amount, prev: Amount): string | null {
    if (current === "-" || prev === "-" || prev === 0) return null;
    const ratio = ((current - prev) / prev) * 100;
    return ratio > 0 ? `+${ratio.toFixed(1)}%` : `${ratio.toFixed(1)}%`;
}

// 前年比が改善しているか（支出は減少が改善）
export function isPositive(current: Amount, prev: Amount, isExpense = false): boolean | null {
    if (current === "-" || prev === "-") return null;
    return isExpense ? current <= prev : current >= prev;
}
