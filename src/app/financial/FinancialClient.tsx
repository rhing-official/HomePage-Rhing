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
import { months, type Amount, type YearData } from "@/data/financialData";
import {
    calculateRatio,
    formatCurrency,
    isPositive,
    monthExpense,
    monthIncome,
    netProfit,
    prevYearKey,
    sumAmounts,
} from "@/lib/financial";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const tabs = [...months, "年次"];

const incomeRows: { key: "subscription" | "creatorMarket" | "donation" | "other"; label: string }[] = [
    { key: "subscription", label: "サブスクリプション" },
    { key: "creatorMarket", label: "daidai横丁 手数料" },
    { key: "donation", label: "寄付" },
    { key: "other", label: "その他" },
];

const expenseRows: { key: "server" | "payment" | "labor" | "marketing" | "legal" | "other"; label: string }[] = [
    { key: "server", label: "サーバー費用" },
    { key: "payment", label: "決済手数料" },
    { key: "labor", label: "備品購入" },
    { key: "marketing", label: "マーケティング" },
    { key: "legal", label: "法務・税務" },
    { key: "other", label: "その他" },
];

const numberOrZero = (v: Amount) => (v === "-" ? 0 : v);

// 前年比の表示（改善は緑、悪化は赤、計算できないときは「-」）
function RatioLabel({ ratio, positive }: { ratio: string | null; positive: boolean | null }) {
    if (!ratio) return <span className="text-gray-400 font-bold">-</span>;
    return <span className={`font-bold ${positive ? "text-green-600" : "text-red-600"}`}>{ratio}</span>;
}

export default function FinancialClient({ years }: { years: Record<string, YearData> }) {
    const availableYears = Object.keys(years);
    const [activeYear, setActiveYear] = useState(availableYears[0]);
    const [activeTab, setActiveTab] = useState("4月");

    const yearData = years[activeYear];
    const prevYearData: YearData | undefined = years[prevYearKey(activeYear)];
    const isAnnualTab = activeTab === "年次";

    // 月ごとの合計（収入・支出）と、前年度の同じ月の合計
    const monthly = months.map((m) => ({
        month: m,
        income: monthIncome(yearData[m]),
        expense: monthExpense(yearData[m]),
        prevIncome: prevYearData ? monthIncome(prevYearData[m]) : ("-" as Amount),
        prevExpense: prevYearData ? monthExpense(prevYearData[m]) : ("-" as Amount),
    }));

    // 年次の合計（未確定の月は含めない）
    const annualIncome = sumAmounts(monthly.map((m) => m.income));
    const annualExpense = sumAmounts(monthly.map((m) => m.expense));
    const annualProfit = netProfit(annualIncome, annualExpense);

    const chartData = {
        labels: months,
        datasets: [
            {
                label: `${activeYear} 収入`,
                data: monthly.map((m) => numberOrZero(m.income)),
                backgroundColor: "#111111",
            },
            {
                label: "前年度 収入",
                data: monthly.map((m) => numberOrZero(m.prevIncome)),
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

    // 月次タブ
    const current = isAnnualTab ? null : monthly.find((m) => m.month === activeTab) ?? null;
    const currentMonth = isAnnualTab ? null : yearData[activeTab];

    return (
        <>
            {/* ====== 年度プルダウン & 月次タブ ====== */}
            <div className="flex flex-col mb-12">
                <div className="mb-10 flex justify-center">
                    <div className="relative w-full max-w-sm">
                        <select
                            value={activeYear}
                            onChange={(e) => setActiveYear(e.target.value)}
                            className="w-full appearance-none bg-white border-2 border-gray-300 rounded-full px-8 py-4 text-lg font-bold tracking-widest text-gray-900 shadow-sm cursor-pointer outline-none transition-all duration-300 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 overflow-x-auto pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-5 text-base font-bold tracking-widest transition-colors whitespace-nowrap ${
                                activeTab === tab
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
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900 text-center">
                            {activeYear} 年間収支推移（前年度比）
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <span className="text-xs font-bold tracking-widest text-gray-500 block mb-2">年間収入</span>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualIncome)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                <span className="text-xs font-bold tracking-widest text-gray-500 block mb-2">年間支出</span>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(annualExpense)}</p>
                            </div>
                            <div className="bg-gray-900 text-white p-6 rounded-xl text-center">
                                <span className="text-xs font-bold tracking-widest text-gray-300 block mb-2">年間純利益</span>
                                <p className="text-2xl font-bold">{formatCurrency(annualProfit)}</p>
                            </div>
                        </div>
                        <div className="w-full h-[400px]">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                ) : current && currentMonth ? (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-10 tracking-widest text-gray-900 border-b border-gray-200 pb-4">
                            {activeYear} {activeTab} 収支報告
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ---- 収入カード ---- */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-bold tracking-widest text-gray-500 block mb-2">INCOME / 収入</span>
                                <p className="text-4xl font-bold text-gray-900 mb-4">{formatCurrency(current.income)}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    {incomeRows.map((row) => (
                                        <div key={row.key} className="flex justify-between text-sm text-gray-600">
                                            <span>{row.label}</span>
                                            <span className="font-medium">{formatCurrency(currentMonth.incomeDetail[row.key])}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                                    <span className="text-gray-500">前年同月: {formatCurrency(current.prevIncome)}</span>
                                    <RatioLabel
                                        ratio={calculateRatio(current.income, current.prevIncome)}
                                        positive={isPositive(current.income, current.prevIncome)}
                                    />
                                </div>
                            </div>

                            {/* ---- 支出カード ---- */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <span className="text-sm font-bold tracking-widest text-gray-500 block mb-2">EXPENSE / 支出</span>
                                <p className="text-4xl font-bold text-gray-900 mb-4">{formatCurrency(current.expense)}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    {expenseRows.map((row) => (
                                        <div key={row.key} className="flex justify-between text-sm text-gray-600">
                                            <span>{row.label}</span>
                                            <span className="font-medium">{formatCurrency(currentMonth.expenseDetail[row.key])}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                                    <span className="text-gray-500">前年同月: {formatCurrency(current.prevExpense)}</span>
                                    <RatioLabel
                                        ratio={calculateRatio(current.expense, current.prevExpense)}
                                        positive={isPositive(current.expense, current.prevExpense, true)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 純利益バー */}
                        <div className="mt-8 bg-gray-900 text-white p-8 rounded-xl flex flex-col md:flex-row justify-between items-center">
                            <span className="text-lg font-bold tracking-widest mb-2 md:mb-0">当月純利益</span>
                            <span className="text-3xl font-bold">{formatCurrency(netProfit(current.income, current.expense))}</span>
                        </div>
                    </div>
                ) : null}

                <p className="mt-10 text-xs text-gray-400 leading-relaxed">
                    「¥ -」は、未確定、または該当なしです。年間の合計には、確定した月の金額だけを含めます。
                </p>
            </div>
        </>
    );
}
