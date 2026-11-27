"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MutableRefObject, type RefObject } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { subscribeTheme } from "@/lib/theme";
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

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const tabs = [...months, "年次"];

// 月のタブを、ホイールで1つ切り替えるのに要る量（ピクセル）。マウスの1目盛りは、約100
const TAB_WHEEL_STEP = 200;
// この時間、回さなかったら、溜めた量を捨てる
const TAB_WHEEL_IDLE_MS = 250;

// グラフの色は、サイトの色トークン（globals.css）から読む。テーマが切り替わったら、読み直して描き直す
function readChartColors() {
    const css = getComputedStyle(document.documentElement);
    const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    return {
        current: get("--color-on-surface", "#111111"),
        previous: get("--color-outline", "#9ca3af"),
        text: get("--color-on-surface-variant", "#4b5563"),
        grid: get("--color-outline-variant", "#e5e7eb"),
    };
}
const isDarkNow = () => document.documentElement.classList.contains("dark");

function useChartColors() {
    // テーマが変わるたびに、値が変わる（真偽値）ので、描き直される
    useSyncExternalStore(subscribeTheme, isDarkNow, () => false);
    return typeof document === "undefined" ? null : readChartColors();
}

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
    if (!ratio) return <span className="text-outline font-bold">-</span>;
    return <span className={`font-bold ${positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{ratio}</span>;
}

// ホイールを、ブラウザの既定のスクロールを止められる形（passive: false）で受ける。
// 呼び出し側の関数は、毎回新しくなっても、最新のものが呼ばれる
function useWheel(ref: RefObject<HTMLElement | null>, handler: (e: WheelEvent) => void) {
    const latest = useRef(handler);
    useEffect(() => {
        latest.current = handler;
    });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const on = (e: WheelEvent) => latest.current(e);
        el.addEventListener("wheel", on, { passive: false });
        return () => el.removeEventListener("wheel", on);
    }, [ref]);
}

// ホイールの、縦横のうち大きい方の量。Firefoxの行単位は、ピクセルに直す
function wheelDelta(e: WheelEvent) {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    return e.deltaMode === 1 ? d * 16 : d;
}

// 選ばれているタブを、行の真ん中へ寄せる。ページ自体は、スクロールさせない
function centerSelected(container: HTMLElement, smooth: boolean) {
    const el = container.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el) return;
    container.scrollTo({ left: el.offsetLeft - (container.clientWidth - el.clientWidth) / 2, behavior: smooth ? "smooth" : "auto" });
}

// 選ばれたタブが変わったら、行の真ん中へ寄せる。つまみながら動かしている間は、寄せない
function useCenterSelected(ref: RefObject<HTMLElement | null>, key: string, dragging: MutableRefObject<boolean>) {
    const first = useRef(true);
    useEffect(() => {
        const container = ref.current;
        if (!container || dragging.current) return;
        centerSelected(container, !first.current);
        first.current = false;
    }, [ref, key, dragging]);
}

type ScrubRow = { ref: RefObject<HTMLElement | null>; onPick: (value: string) => void };

// 年度と月の、2つの行をまたいで、押したまま動かして切り替える。
// - 横に動かすと、ポインターの高さに一番近い行の中で、横位置に一番近いタブに切り替わる。月を押したまま、上の年度の行へ動かせば、年度も切り替わる
// - 行の端（または外）へ動かすと、行が自動でスクロールして、見えていないタブにも届く
// - 離したら、選んだタブを、行の真ん中へ寄せる。動かしている間は、寄せない
// タブは、role="tab" と data-value を持つ。動かし始める前は何もせず、普通のクリックは、そのまま働く
function useScrubRows(rows: ScrubRow[], scrubbing: MutableRefObject<boolean>) {
    const latest = useRef(rows);
    useEffect(() => {
        latest.current = rows;
    });
    useEffect(() => {
        const els = latest.current.map((r) => r.ref.current);
        if (els.some((el) => !el)) return;
        const rowEls = els as HTMLElement[];
        let start: { x: number; y: number; id: number; origin: HTMLElement } | null = null;
        let pointer = { x: 0, y: 0 };
        let raf = 0;

        // ポインターの高さに、一番近い行。行の中なら距離0
        const rowIndexAt = (y: number) => {
            let best = 0;
            let bestDist = Infinity;
            rowEls.forEach((row, i) => {
                const r = row.getBoundingClientRect();
                const dist = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
                if (dist < bestDist) {
                    best = i;
                    bestDist = dist;
                }
            });
            return best;
        };
        // 行の中で、ポインターの横位置に、一番近いタブ
        const nearestTab = (row: HTMLElement, x: number) => {
            let best: HTMLElement | null = null;
            let bestDist = Infinity;
            for (const tab of row.querySelectorAll<HTMLElement>('[role="tab"]')) {
                const r = tab.getBoundingClientRect();
                const dist = Math.abs(x - (r.left + r.right) / 2);
                if (dist < bestDist) {
                    best = tab;
                    bestDist = dist;
                }
            }
            return best;
        };
        // 動かしている間、毎コマ、行の端なら自動でスクロールして、ポインターの下のタブを選ぶ
        const tick = () => {
            if (!start) return;
            const i = rowIndexAt(pointer.y);
            const row = rowEls[i];
            const r = row.getBoundingClientRect();
            const ZONE = 56;
            const MAX = 16;
            if (pointer.x < r.left + ZONE) row.scrollLeft -= MAX * Math.min(1, (r.left + ZONE - pointer.x) / ZONE);
            else if (pointer.x > r.right - ZONE) row.scrollLeft += MAX * Math.min(1, (pointer.x - (r.right - ZONE)) / ZONE);
            const value = nearestTab(row, pointer.x)?.dataset.value;
            if (value) latest.current[i].onPick(value);
            raf = requestAnimationFrame(tick);
        };

        const down = (e: PointerEvent) => {
            if (e.button !== 0 || !(e.target as HTMLElement).closest('[role="tab"]')) return;
            start = { x: e.clientX, y: e.clientY, id: e.pointerId, origin: e.currentTarget as HTMLElement };
            pointer = { x: e.clientX, y: e.clientY };
        };
        const move = (e: PointerEvent) => {
            if (!start) return;
            pointer = { x: e.clientX, y: e.clientY };
            if (!scrubbing.current) {
                if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
                scrubbing.current = true;
                start.origin.setPointerCapture(start.id);
                raf = requestAnimationFrame(tick);
            }
        };
        const up = () => {
            const was = scrubbing.current;
            start = null;
            scrubbing.current = false;
            cancelAnimationFrame(raf);
            // 切り替えが描画に反映されてから、寄せる
            if (was) requestAnimationFrame(() => rowEls.forEach((row) => centerSelected(row, true)));
        };
        for (const row of rowEls) {
            row.addEventListener("pointerdown", down);
            row.addEventListener("pointermove", move);
            row.addEventListener("pointerup", up);
            row.addEventListener("pointercancel", up);
        }
        return () => {
            cancelAnimationFrame(raf);
            for (const row of rowEls) {
                row.removeEventListener("pointerdown", down);
                row.removeEventListener("pointermove", move);
                row.removeEventListener("pointerup", up);
                row.removeEventListener("pointercancel", up);
            }
        };
    }, [scrubbing]);
}

// スクロールバーは出さない。ホイール・ドラッグ・タッチで動かす
const hideScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// 金額を、前の値から新しい値へ、数え上がるように変える。どちらかが未確定の「-」の時は、動かさない。
// 月の切り替えでは、内容が作り直されるので、前の月の値を from で受け取って、そこから始める
function AnimatedAmount({ from, to }: { from: Amount; to: Amount }) {
    const mv = useMotionValue(typeof from === "number" ? from : typeof to === "number" ? to : 0);
    const text = useTransform(mv, (v) => formatCurrency(Math.round(v)));
    useEffect(() => {
        if (typeof to !== "number") return;
        const controls = animate(mv, to, { duration: 0.5, ease: [0.2, 0, 0, 1] });
        return () => controls.stop();
    }, [to, mv]);
    if (typeof to !== "number") return <>{formatCurrency(to)}</>;
    return <motion.span>{text}</motion.span>;
}

// 行の左右で、タブが途切れている側だけ、端をぼかして滲ませる（マスクの幅を、--fl と --fr で渡す）。
// 端まで来て、隠れているタブが無い側は、ぼかさない
const EDGE_FADE = 48;
const edgeFadeMask = "linear-gradient(to right, transparent 0, #000 var(--fl, 0px), #000 calc(100% - var(--fr, 0px)), transparent 100%)";
function useEdgeFade(rowRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        const update = () => {
            const left = row.scrollLeft > 1 ? EDGE_FADE : 0;
            const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 1 ? EDGE_FADE : 0;
            row.style.setProperty("--fl", `${left}px`);
            row.style.setProperty("--fr", `${right}px`);
        };
        update();
        row.addEventListener("scroll", update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(row);
        return () => {
            row.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [rowRef]);
}

// 選んだタブの下の棒を、タブの間で滑らせる。行がスクロールしても、行の中の位置で動くので、ずれない。
// 最初の1回と、行の幅が変わった時は、動かさずに合わせる。動きを減らす設定の時も、動かさない
function useSlidingIndicator(
    rowRef: RefObject<HTMLElement | null>,
    barRef: RefObject<HTMLElement | null>,
    key: string,
) {
    useEffect(() => {
        const row = rowRef.current;
        const bar = barRef.current;
        if (!row || !bar) return;
        const place = (animated: boolean) => {
            const el = row.querySelector<HTMLElement>('[aria-selected="true"]');
            if (!el) return;
            bar.style.transition = animated ? "transform 0.3s cubic-bezier(0.2, 0, 0, 1), width 0.3s cubic-bezier(0.2, 0, 0, 1)" : "none";
            bar.style.transform = `translateX(${el.offsetLeft}px)`;
            bar.style.width = `${el.offsetWidth}px`;
        };
        place(bar.dataset.placed === "1");
        bar.dataset.placed = "1";
        const observer = new ResizeObserver(() => place(false));
        observer.observe(row);
        return () => observer.disconnect();
    }, [rowRef, barRef, key]);
}

// 年度のタブ。月のタブと同じ作りで、選んだ年度は濃くなる。下の棒は、行の側が滑らせる
function YearTab({
    value,
    selected,
    onSelect,
    children,
}: {
    value: string;
    selected: boolean;
    onSelect: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            data-value={value}
            role="tab"
            aria-selected={selected}
            onClick={onSelect}
            className={`px-4 py-5 text-base font-bold tracking-widest transition-colors whitespace-nowrap ${
                selected ? "text-on-surface" : "text-outline hover:text-on-surface-variant"
            }`}
        >
            {children}
        </button>
    );
}

export default function FinancialClient({ years: yearsProp }: { years: Record<string, YearData> }) {
    const years = yearsProp;
    // 年度は、古い順（新しい年度が下）に並べる。最初に開く年度は、一番新しいもの
    const availableYears = Object.keys(years).sort((x, y) => parseInt(x, 10) - parseInt(y, 10));
    const [selectedYear, setActiveYear] = useState(availableYears[availableYears.length - 1]);
    // 仮の数字と本物で、年度の一覧が変わっても、有る年度を指す
    const activeYear = years[selectedYear] ? selectedYear : availableYears[availableYears.length - 1];
    // 切り替える前の月と、動いた向き（次の月へ進むなら 1、前へ戻るなら -1）も持つ。内容の滑る向きと、金額の数え上がりの始まりに使う
    const [tabState, setTabState] = useState({ tab: "4月", prev: "4月", dir: 1 });
    const activeTab = tabState.tab;
    const setActiveTab = (next: string) =>
        setTabState((s) => (s.tab === next ? s : { tab: next, prev: s.tab, dir: Math.sign(tabs.indexOf(next) - tabs.indexOf(s.tab)) || 1 }));
    const indicatorRef = useRef<HTMLSpanElement>(null);
    const yearIndicatorRef = useRef<HTMLSpanElement>(null);
    const yearRowRef = useRef<HTMLDivElement>(null);
    const tabRowRef = useRef<HTMLDivElement>(null);
    const tabWheel = useRef({ acc: 0, time: 0 });
    const scrubbing = useRef(false);

    // 年度の行: ホイールで、横にスクロールする。ポインターが行の上に有る間は、端まで来ても、ページをスクロールさせない
    useWheel(yearRowRef, (e) => {
        const el = yearRowRef.current;
        if (!el) return;
        e.preventDefault();
        el.scrollLeft += wheelDelta(e);
    });

    // 月の行: ホイールの量を溜めて、一定量ごとに、タブを1つ切り替える。ポインターが行の上に有る間は、端でも、ページをスクロールさせない
    useWheel(tabRowRef, (e) => {
        e.preventDefault();
        const d = wheelDelta(e);
        const now = performance.now();
        const wheel = tabWheel.current;
        // 止まっていた後と、向きが変わった時は、溜めた量を捨てる
        if (now - wheel.time > TAB_WHEEL_IDLE_MS || Math.sign(d) !== Math.sign(wheel.acc)) wheel.acc = 0;
        wheel.time = now;
        wheel.acc += d;
        const steps = Math.trunc(wheel.acc / TAB_WHEEL_STEP);
        if (steps === 0) return;
        wheel.acc -= steps * TAB_WHEEL_STEP;
        const next = Math.min(Math.max(tabs.indexOf(activeTab) + steps, 0), tabs.length - 1);
        if (tabs[next] !== activeTab) setActiveTab(tabs[next]);
    });
    useCenterSelected(yearRowRef, activeYear, scrubbing);
    useCenterSelected(tabRowRef, activeTab, scrubbing);
    // 年度の行は、途切れている側の端を、滲ませる
    useEdgeFade(yearRowRef);
    // 年度と月の下線: 選んだタブの下へ、滑って移る
    useSlidingIndicator(yearRowRef, yearIndicatorRef, activeYear);
    useSlidingIndicator(tabRowRef, indicatorRef, activeTab);
    // 押したまま動かして、年度・月を切り替える。年度の行と月の行は、またいで動かせる
    useScrubRows(
        [
            { ref: yearRowRef, onPick: setActiveYear },
            { ref: tabRowRef, onPick: setActiveTab },
        ],
        scrubbing,
    );

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

    const colors = useChartColors();

    // 年度を切り替えると、同じ線が、新しい形へ滑らかに変形する（Chart.js が、点の位置を補間する）。
    // 右端の点だけ大きくする。動きを減らす設定の時は、動かさない
    const lastIndex = months.length - 1;
    const chartData = {
        labels: months,
        datasets: [
            {
                label: `${activeYear} 収入`,
                data: monthly.map((m) => numberOrZero(m.income)),
                borderColor: colors?.current ?? "#111111",
                backgroundColor: colors?.current ?? "#111111",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: months.map((_, i) => (i === lastIndex ? 7 : 3)),
                pointHoverRadius: months.map((_, i) => (i === lastIndex ? 9 : 5)),
            },
            {
                label: "前年度 収入",
                data: monthly.map((m) => numberOrZero(m.prevIncome)),
                borderColor: colors?.previous ?? "#cccccc",
                backgroundColor: colors?.previous ?? "#cccccc",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeInOutCubic" as const },
        interaction: { mode: "index" as const, intersect: false },
        plugins: {
            legend: { position: "top" as const, labels: { color: colors?.text } },
            title: { display: false },
        },
        scales: {
            x: { ticks: { color: colors?.text }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: colors?.text }, grid: { color: colors?.grid } },
        },
    };

    // 切り替える前の月（または年次）の金額。数え上がりの始まりの値
    const amountsFor = (tab: string): { income: Amount; expense: Amount; profit: Amount } => {
        if (tab === "年次") return { income: annualIncome, expense: annualExpense, profit: annualProfit };
        const m = monthly.find((x) => x.month === tab);
        return m ? { income: m.income, expense: m.expense, profit: netProfit(m.income, m.expense) } : { income: "-", expense: "-", profit: "-" };
    };
    const prevAmounts = amountsFor(tabState.prev);

    // 月次タブ
    const current = isAnnualTab ? null : monthly.find((m) => m.month === activeTab) ?? null;
    const currentMonth = isAnnualTab ? null : yearData[activeTab];

    return (
        <>
            {/* ====== 年度プルダウン & 月次タブ ====== */}
            <div className="flex flex-col mb-12">
                {/* 年度のタブ。月のタブと同じ作り。選んだ年度の下の棒が、滑って移る */}
                <div
                    ref={yearRowRef}
                    role="tablist"
                    aria-label="年度"
                    style={{ maskImage: edgeFadeMask, WebkitMaskImage: edgeFadeMask }}
                    className={`relative mb-10 touch-none select-none border-b border-outline-variant overflow-x-auto overflow-y-hidden ${hideScrollbar}`}
                >
                    <div className="flex w-max min-w-full items-center justify-between">
                        {availableYears.map((year) => (
                            <YearTab key={year} value={year} selected={year === activeYear} onSelect={() => setActiveYear(year)}>
                                {year}
                            </YearTab>
                        ))}
                    </div>
                    <span ref={yearIndicatorRef} aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-on-surface" />
                </div>

                <div
                    ref={tabRowRef}
                    role="tablist"
                    aria-label="月"
                    className={`relative flex touch-none select-none justify-between items-center border-b border-outline-variant overflow-x-auto overflow-y-hidden ${hideScrollbar}`}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            data-value={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-5 text-base font-bold tracking-widest transition-colors whitespace-nowrap ${
                                activeTab === tab ? "text-on-surface" : "text-outline hover:text-on-surface-variant"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <span ref={indicatorRef} aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-on-surface" />
                </div>
            </div>

            {/* ====== コンテンツエリア ====== */}
            <div className="bg-surface-container p-8 md:p-12 rounded-m3-lg min-h-[500px]">
                {/* 月の切り替え: 内容が、進む向きに合わせて滑って入れ替わる。素早く切り替える時は、途中の月を飛ばす */}
                <AnimatePresence mode="wait" initial={false} custom={tabState.dir}>
                    <motion.div
                        key={activeTab}
                        custom={tabState.dir}
                        variants={{
                            enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
                            show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] } },
                            leave: (dir: number) => ({ opacity: 0, x: dir * -24, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }),
                        }}
                        initial="enter"
                        animate="show"
                        exit="leave"
                    >
                {isAnnualTab ? (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-8 tracking-widest text-on-surface text-center">
                            {activeYear} 年間収支推移（前年度比）
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant text-center">
                                <span className="text-xs font-bold tracking-widest text-on-surface-subtle block mb-2">年間収入</span>
                                <p className="text-2xl font-bold text-on-surface"><AnimatedAmount from={prevAmounts.income} to={annualIncome} /></p>
                            </div>
                            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant text-center">
                                <span className="text-xs font-bold tracking-widest text-on-surface-subtle block mb-2">年間支出</span>
                                <p className="text-2xl font-bold text-on-surface"><AnimatedAmount from={prevAmounts.expense} to={annualExpense} /></p>
                            </div>
                            <div className="bg-on-surface text-surface p-6 rounded-xl text-center">
                                <span className="text-xs font-bold tracking-widest text-outline block mb-2">年間純利益</span>
                                <p className="text-2xl font-bold"><AnimatedAmount from={prevAmounts.profit} to={annualProfit} /></p>
                            </div>
                        </div>
                        <div className="w-full h-[400px]">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                ) : current && currentMonth ? (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-10 tracking-widest text-on-surface border-b border-outline-variant pb-4">
                            {activeYear} {activeTab} 収支報告
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ---- 収入カード ---- */}
                            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant">
                                <span className="text-sm font-bold tracking-widest text-on-surface-subtle block mb-2">INCOME / 収入</span>
                                <p className="text-4xl font-bold text-on-surface mb-4"><AnimatedAmount from={prevAmounts.income} to={current.income} /></p>

                                <div className="bg-surface-container rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-outline tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    {incomeRows.map((row) => (
                                        <div key={row.key} className="flex justify-between text-sm text-on-surface-variant">
                                            <span>{row.label}</span>
                                            <span className="font-medium">{formatCurrency(currentMonth.incomeDetail[row.key])}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-outline-variant pt-4">
                                    <span className="text-on-surface-subtle">前年同月: {formatCurrency(current.prevIncome)}</span>
                                    <RatioLabel
                                        ratio={calculateRatio(current.income, current.prevIncome)}
                                        positive={isPositive(current.income, current.prevIncome)}
                                    />
                                </div>
                            </div>

                            {/* ---- 支出カード ---- */}
                            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant">
                                <span className="text-sm font-bold tracking-widest text-on-surface-subtle block mb-2">EXPENSE / 支出</span>
                                <p className="text-4xl font-bold text-on-surface mb-4"><AnimatedAmount from={prevAmounts.expense} to={current.expense} /></p>

                                <div className="bg-surface-container rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-bold text-outline tracking-widest mb-3">BREAKDOWN / 内訳</p>
                                    {expenseRows.map((row) => (
                                        <div key={row.key} className="flex justify-between text-sm text-on-surface-variant">
                                            <span>{row.label}</span>
                                            <span className="font-medium">{formatCurrency(currentMonth.expenseDetail[row.key])}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-outline-variant pt-4">
                                    <span className="text-on-surface-subtle">前年同月: {formatCurrency(current.prevExpense)}</span>
                                    <RatioLabel
                                        ratio={calculateRatio(current.expense, current.prevExpense)}
                                        positive={isPositive(current.expense, current.prevExpense, true)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 純利益バー */}
                        <div className="mt-8 bg-on-surface text-surface p-8 rounded-xl flex flex-col md:flex-row justify-between items-center">
                            <span className="text-lg font-bold tracking-widest mb-2 md:mb-0">当月純利益</span>
                            <span className="text-3xl font-bold"><AnimatedAmount from={prevAmounts.profit} to={netProfit(current.income, current.expense)} /></span>
                        </div>
                    </div>
                ) : null}

                    </motion.div>
                </AnimatePresence>

                <p className="mt-10 text-xs text-outline leading-relaxed">
                    「¥ -」は、未確定、または該当なしです。年間の合計には、確定した月の金額だけを含めます。
                </p>
            </div>
        </>
    );
}
