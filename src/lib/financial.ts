import { allYearData, months, type Amount, type ExpenseDetail, type IncomeDetail, type MonthData, type YearData } from "@/data/financialData";

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

// デバッグ用の仮の数字（2025年度と2026年度）。開発サーバーでは、`/financial` を開くと、既定で使う。`?demo=0` を付けると、本物のデータになる。本番のビルドでは使わない。
// グラフの切り替えの動きを確かめるため、2年の線の形を大きく変えてある。実際の金額ではない。
export function demoFinancialYears(): Record<string, YearData> {
    const round = (n: number) => Math.round(n / 100) * 100;
    const build = (income: (i: number) => IncomeDetail): YearData =>
        Object.fromEntries(
            months.map((m, i) => {
                const inc = income(i);
                const sub = inc.subscription as number;
                const expense: ExpenseDetail = {
                    server: 3000 + i * 200,
                    payment: round(sub * 0.036),
                    labor: 2000 + (i % 4) * 1000,
                    marketing: 1000 + (i % 5) * 500,
                    legal: i === 2 || i === 8 ? 12000 : 0,
                    other: 500,
                };
                return [m, { incomeDetail: inc, expenseDetail: expense } satisfies MonthData];
            }),
        );

    // 年度ごとに、線の形を変える。2025年度は右肩上がり、2026年度は山なり。残りは、形を順に変える
    const shapes: ((i: number) => number)[] = [
        (i) => i / 11, // 右肩上がり
        (i) => Math.sin((i / 11) * Math.PI), // 山なり
        (i) => 1 - Math.sin((i / 11) * Math.PI), // 谷
        (i) => 1 - i / 11, // 右肩下がり
        (i) => 0.5 + 0.5 * Math.sin((i / 11) * Math.PI * 3), // 波
    ];
    const result: Record<string, YearData> = {};
    // 新しい年度が先。画面側で、古い順に並べ直す
    for (let year = 2026; year >= 2017; year--) {
        const shape = year === 2025 ? shapes[0] : year === 2026 ? shapes[1] : shapes[(year - 2017) % shapes.length];
        const scale = 0.6 + (year - 2017) * 0.07; // 古い年度ほど、小さな金額
        result[`${year}年度`] = build((i) => ({
            subscription: round((8000 + 9000 * shape(i) + (i % 3) * 600) * scale),
            creatorMarket: round((2000 + 5000 * shape((i + 3) % 12)) * scale),
            donation: round(1500 + ((i * 7 + year) % 5) * 900),
            other: i % 2 === 0 ? 800 : 300,
        }));
    }
    return result;
}
