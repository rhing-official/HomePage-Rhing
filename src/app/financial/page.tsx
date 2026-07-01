"use client";

import { useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ============================================================
// 年度ごとのデータ定義
// 金額が未確定の場合は "-" のままにしてください。
// 実績が確定したら数値（例: 1200000）に書き換えてください。
// ============================================================

const months = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"];
const tabs = [...months, "年次"];

// 収入の細目
type IncomeDetail = {
    subscription: number | "-";   // サブスクリプション収入
    creatorMarket: number | "-";  // クリエイターマーケット（daidai横丁）手数料
    other: number | "-";          // その他収入
};

// 支出の細目
type ExpenseDetail = {
    server: number | "-";         // サーバー費用（GCP/Firebase）
    payment: number | "-";        // 決済手数料（Stripe）
    labor: number | "-";          // 人件費
    marketing: number | "-";      // マーケティング費用
    legal: number | "-";          // 法務・税務
    other: number | "-";          // その他支出
};

type MonthData = {
    currentIncome: number | "-";
    prevIncome: number | "-";
    currentExpense: number | "-";
    prevExpense: number | "-";
    currentIncomeDetail: IncomeDetail;
    currentExpenseDetail: ExpenseDetail;
};

// YearData は月名（"4月"〜"3月"）のみをキーに持つ
// "年次" はキーに含めない（年次タブは月データから自動集計）
type YearData = Record<string, MonthData>;

// ============================================================
// 2026年度データ（すべてハイフン）
// ============================================================
const data2026: YearData = {
    "4月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "5月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "6月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "7月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "8月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "9月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "10月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "11月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "12月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "1月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "2月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
    "3月": {
        currentIncome: "-", prevIncome: "-", currentExpense: "-", prevExpense: "-",
        currentIncomeDetail: { subscription: "-", creatorMarket: "-", other: "-" },
        currentExpenseDetail: { server: "-", payment: "-", labor: "-", marketing: "-", legal: "-", other: "-" },
    },
};

// ============================================================
// 年度を追加するときは allYearData にキーを追記してください。
// 最大5年度まで登録できます。それ以上は古い年度を削除してください。
//
// 追加手順:
//   1. const data20XX: YearData = { ... }; を上に定義する
//   2. allYearData に "20XX年度": data20XX を追記する
// ============================================================

const allYearData: Record<string, YearData> = {
    // ↓ 最大5件まで登録可能
    "2026年度": data2026,
    // "2027年度": data2027,
    // "2028年度": data2028,
    // "2029年度": data2029,
    // "2030年度": data2030,
};

const availableYears = Object.keys(allYearData);

// ============================================================
// ヘルパー関数
// ============================================================

// 金額を「¥ -」または「¥1,200,000」形式で表示する
const formatCurrency = (amount: number | "-"): string => {
    if (amount === "-") return "¥ -";
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
};

// 前年比（%）を計算する
const calculateRatio = (current: number | "-", prev: number | "-"): string | null => {
    if (current === "-" || prev === "-" || prev === 0) return null;
    const ratio = ((current - prev) / prev) * 100;
    return ratio > 0 ? `+${ratio.toFixed(1)}%` : `${ratio.toFixed(1)}%`;
};

// 前年比が改善しているか判定する（支出は減少が改善）
const isPositive = (current: number | "-", prev: number | "-", isExpense = false): boolean | null => {
    if (current === "-" || prev === "-") return null;
    return isExpense ? current <= prev : current >= prev;
};

// ============================================================
// メインコンポーネント
// ============================================================
export default function FinancialPage() {
    const [activeYear, setActiveYear] = useState(availableYears[0]);
    const [activeTab, setActiveTab] = useState("4月");

    const monthlyData = allYearData[activeYear];

    // ★ 修正ポイント：activeTab が "年次" のときは monthlyData["年次"] を参照しない
    const isAnnualTab = activeTab === "年次";
    const currentMonthData = isAnnualTab ? null : monthlyData[activeTab];

    // 年次グラフ用データ（"-" は 0 として扱う）
    const chartData = {
        labels: months,
        datasets: [
            {
                label: `${activeYear} 収入`,
                data: months.map((m) => {
                    const v = monthlyData[m].currentIncome;
                    return v === "-" ? 0 : v;
                }),
                backgroundColor: "#111111",
            },
            {
                label: "前年度 収入",
                data: months.map((m) => {
                    const v = monthlyData[m].prevIncome;
                    return v === "-" ? 0 : v;
                }),
                backgroundColor: "#cccccc",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: false },
        },
    };

    // 月次タブ用の計算（currentMonthData が null のときは使われない）
    const ratio = currentMonthData
        ? calculateRatio(currentMonthData.currentIncome, currentMonthData.prevIncome)
        : null;
    const isIncomePositive = currentMonthData
        ? isPositive(currentMonthData.currentIncome, currentMonthData.prevIncome)
        : null;
    const isExpensePositive = currentMonthData
        ? isPositive(currentMonthData.currentExpense, currentMonthData.prevExpense, true)
        : null;
    const expenseRatio = currentMonthData
        ? calculateRatio(currentMonthData.currentExpense, currentMonthData.prevExpense)
        : null;
    const netProfit: number | "-" =
        currentMonthData &&
            currentMonthData.currentIncome !== "-" &&
            currentMonthData.currentExpense !== "-"
            ? (currentMonthData.currentIncome as number) - (currentMonthData.currentExpense as number)
            : "-";

    return (
        <div className="container mx-auto px-6 py-24 max-w-5xl">

            {/* ページタイトル */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">FINANCIAL</h1>
                <p className="text-gray-500 tracking-wider text-sm">収支報告</p>
            </div>

            {/* ====== 年度プルダウン & 月次タブセクション ====== */}
            <div className="flex flex-col mb-12">

                {/* ====== 年度プルダウン ====== */}
                <div className="mb-10 flex justify-center">
                    <div className="relative w-full max-w-sm"> {/* 🌟 max-w-sm で大きすぎないサイズに */}
                        <select
                            value={activeYear}
                            onChange={(e) => setActiveYear(e.target.value)}
                            // 🌟 appearance-none でブラウザ標準の矢印を消去
                            className="w-full appearance-none bg-white border-2 border-gray-300 rounded-full px-8 py-4 text-lg font-bold tracking-widest text-gray-900 shadow-sm cursor-pointer outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>

                        {/* 🌟 矢印を自前で配置：右端から少し内側に寄せました */}
                        <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 月次タブ：左右に広げる */}
                <div className="flex justify-between items-center border-b border-gray-200 overflow-x-auto scrollbar-hide pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-5 text-base font-bold tracking-widest transition-colors whitespace-nowrap ${activeTab === tab
                                ? "border-b-2 border-gray-900 text-gray-900"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ====== コンテンツエリア ====== */}
            <div className="bg-[#f8f8f8] p-8 md:p-12 rounded-2xl min-h-[500px]">
                {isAnnualTab ? (
                    <div className="w-full h-[400px]">
                        <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900 text-center">
                            {activeYear} 年間収支推移（前年度比）
                        </h2>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : currentMonthData ? (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-10 tracking-widest text-gray-900 border-b border-gray-200 pb-4">
                            {activeYear} {activeTab} 収支報告
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ---- 収入カード ---- */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-bold tracking-widest text-gray-500 block mb-2">INCOME / 収入</span>
                                <p className="text-4xl font-bold text-gray-900 mb-4">{formatCurrency(currentMonthData.currentIncome)}</p>

                                {/* 収入の細目 */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>サブスクリプション</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentIncomeDetail.subscription)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>daidai横丁 手数料</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentIncomeDetail.creatorMarket)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>その他</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentIncomeDetail.other)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                                    <span className="text-gray-500">
                                        前年同月: {formatCurrency(currentMonthData.prevIncome)}
                                    </span>
                                    {ratio ? (
                                        <span className={`font-bold ${isIncomePositive ? "text-green-600" : "text-red-600"}`}>
                                            {ratio}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 font-bold">-</span>
                                    )}
                                </div>

                            </div>

                            {/* ---- 支出カード ---- */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-bold tracking-widest text-gray-500 block mb-2">EXPENSE / 支出</span>
                                <p className="text-4xl font-bold text-gray-900 mb-4">{formatCurrency(currentMonthData.currentExpense)}</p>

                                {/* 支出の細目 */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>サーバー費用</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.server)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>決済手数料</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.payment)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>人件費</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.labor)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>マーケティング</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.marketing)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>法務・税務</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.legal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>その他</span>
                                        <span className="font-medium">{formatCurrency(currentMonthData.currentExpenseDetail.other)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                                    <span className="text-gray-500">
                                        前年同月: {formatCurrency(currentMonthData.prevExpense)}
                                    </span>
                                    {expenseRatio ? (
                                        <span className={`font-bold ${isExpensePositive ? "text-green-600" : "text-red-600"}`}>
                                            {expenseRatio}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 font-bold">-</span>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* 純利益バー */}
                        <div className="mt-8 bg-gray-900 text-white p-8 rounded-xl flex flex-col md:flex-row justify-between items-center">
                            <span className="text-lg font-bold tracking-widest mb-2 md:mb-0">当月純利益</span>
                            <span className="text-3xl font-bold">{formatCurrency(netProfit)}</span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
