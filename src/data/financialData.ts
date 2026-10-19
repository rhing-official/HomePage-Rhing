// ============================================================
// 収支報告のデータ
//
// ・金額が未確定、または該当なしのときは "-" のままにしておく。
// ・実績が確定したら、数値（例: 1200）に書き換える。
// ・収入・支出の合計、前年比、純利益、年間合計は、ここの内訳から自動で計算する
//   （前年の数値は、前の年度のデータから計算するので、手入力しない）。
//
// 年度を追加する手順:
//   1. `data20XX` を、`createYear()` で作って、必要な月だけ書き換える
//   2. `allYearData` に "20XX年度": data20XX を追記する
//
// 将来の自動入力のメモ（今回は未実装。`src/lib/financial.ts` の
// `getFinancialData()` の中身を差し替えるだけで済むようにしてある）:
//   ・サブスク収入・寄付（カード・PayPay）・決済手数料: Stripeの残高明細
//   ・サーバー費用: Google Cloud（Firebase）の請求データの出力
//   ・ビットコインの寄付: NOWPaymentsの履歴、またはSBI VCトレードの入庫履歴
//   ・手入力が必要な項目（人件費・法務・税務など）: スプレッドシートやFirestore
// ============================================================

export type Amount = number | "-";

// 収入の内訳
export type IncomeDetail = {
    subscription: Amount;   // サブスクリプション収入
    creatorMarket: Amount;  // クリエイターマーケット（daidai横丁）手数料
    donation: Amount;       // 寄付
    other: Amount;          // その他収入
};

// 支出の内訳
export type ExpenseDetail = {
    server: Amount;         // サーバー費用（Google Cloud/Firebase）
    payment: Amount;        // 決済手数料（Stripe等）
    labor: Amount;          // 人件費
    marketing: Amount;      // マーケティング費用
    legal: Amount;          // 法務・税務
    other: Amount;          // その他支出
};

export type MonthData = {
    incomeDetail: IncomeDetail;
    expenseDetail: ExpenseDetail;
};

// 月名（"4月"〜"3月"）をキーに持つ。年度は4月始まり、3月終わり。
export type YearData = Record<string, MonthData>;

export const months = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"];

const emptyMonth = (): MonthData => ({
    incomeDetail: { subscription: "-", creatorMarket: "-", donation: "-", other: "-" },
    expenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
});

// 全ての月が "-" の年度データを作る
const createYear = (): YearData => Object.fromEntries(months.map((m) => [m, emptyMonth()]));

// ============================================================
// 2026年度（2026年4月〜2027年3月）。すべて未確定。
// ============================================================
const data2026: YearData = createYear();

export const allYearData: Record<string, YearData> = {
    "2026年度": data2026,
    // "2027年度": data2027,
};
