"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    addDays,
    dateKey,
    monthCells,
    parseDateKey,
    shiftMonth,
    weekdayLabels,
    weekdayName,
} from "@/lib/calendarGrid";
import { DELETION_MAX_AHEAD_MS, DELETION_MIN_NOTICE_MS, parseJstInput, toJstInput, validateDeleteAt } from "@/lib/packDeletion";
import ModalPortal from "@/components/ModalPortal";

// 削除する日時（日本時間）を選ぶダイアログ。DaiDaiアプリのカレンダー（multi_date_picker_dialog.dart）の
// 見た目に合わせる: 上に選択中の日付、月の切り替え（「2026/11」）、曜日の見出し、角丸のマス
// （選択=塗りつぶし、今日=枠線、選べない日=薄く）。日付のあとに時刻を選び、「完了」で検査する。
// value / onSubmit の値は "YYYY-MM-DDTHH:mm"（日本時間、<input type="datetime-local">と同じ形）。

const MINUTE_STEP = 5; // 削除の処理は5分ごとに動くため、5分刻み
const cellBase = "aspect-square rounded-lg text-sm flex items-center justify-center transition-colors";

export default function DateTimePickerDialog({
    value,
    onSubmit,
    onClose,
}: {
    value: string;
    onSubmit: (value: string) => void;
    onClose: () => void;
}) {
    // 選べる日付の範囲（日本時間の日付）。開いた時点の時刻で決める
    const [{ minKey, maxKey, todayKey }] = useState(() => {
        const now = Date.now();
        return {
            minKey: toJstInput(new Date(now + DELETION_MIN_NOTICE_MS)).slice(0, 10),
            maxKey: toJstInput(new Date(now + DELETION_MAX_AHEAD_MS)).slice(0, 10),
            todayKey: toJstInput(new Date(now)).slice(0, 10),
        };
    });

    const [picked, setPicked] = useState(value.slice(0, 10));
    const [hour, setHour] = useState(Number(value.slice(11, 13)));
    const [minute, setMinute] = useState(Math.floor(Number(value.slice(14, 16)) / MINUTE_STEP) * MINUTE_STEP);
    const initial = parseDateKey(value.slice(0, 10));
    const [view, setView] = useState({ year: initial.year, month: initial.month });
    const [error, setError] = useState<string | null>(null);

    // 矢印キーで動かしたときだけ、移動先のマスへフォーカスを移す
    const focusKey = useRef<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!focusKey.current) return;
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${focusKey.current}"]`)?.focus();
        focusKey.current = null;
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const inRange = (key: string) => key >= minKey && key <= maxKey;
    const prevMonth = shiftMonth(view.year, view.month, -1);
    const nextMonth = shiftMonth(view.year, view.month, 1);
    const canGoPrevious = dateKey(prevMonth.year, prevMonth.month, 1) <= maxKey && dateKey(view.year, view.month, 1) > minKey;
    const canGoNext = dateKey(nextMonth.year, nextMonth.month, 1) <= maxKey;

    // キーボードで入るマス（選択中の日が、表示中の月にあればそれ、無ければ、その月の最初の選べる日）
    const cells = monthCells(view.year, view.month);
    const visibleKeys = cells.filter((c) => c.inMonth).map((c) => dateKey(c.year, c.month, c.day));
    const tabKey = visibleKeys.includes(picked) && inRange(picked) ? picked : visibleKeys.find(inRange);

    const select = (key: string) => {
        setPicked(key);
        setError(null);
    };

    const onGridKeyDown = (e: React.KeyboardEvent, key: string) => {
        const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (delta === undefined) return;
        e.preventDefault();
        const next = addDays(key, delta);
        if (!inRange(next)) return;
        const { year, month } = parseDateKey(next);
        setView({ year, month });
        focusKey.current = next;
    };

    const pickedParts = parseDateKey(picked);
    const pickedLabel = `${pickedParts.month}/${pickedParts.day}(${weekdayName(pickedParts.year, pickedParts.month, pickedParts.day)}) ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    const handleDone = () => {
        const text = `${picked}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const problem = validateDeleteAt(parseJstInput(text), new Date());
        if (problem) {
            setError(problem); // 閉じずに、理由を出す
            return;
        }
        onSubmit(text);
    };

    const navButton = "p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:text-outline disabled:hover:bg-transparent disabled:cursor-not-allowed";
    const select_ = "rounded-lg border border-outline-variant bg-surface-container-lowest/70 px-3 py-2 text-sm text-on-surface";

    return (
        <ModalPortal>
        <div
            // 月によって週の数（4〜6行）が変わり、高さが変わる。上端の位置は固定して、下端だけが伸びるようにする（縦中央にそろえない）
            className="fixed inset-0 bg-black/20 z-[100] flex items-start justify-center p-4 pt-[10vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="削除する日時を選ぶ"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-sm bg-surface-container-lowest rounded-m3-xl shadow-elevation-3 p-6 flex flex-col gap-4">
                <p className="text-2xl text-on-surface">{pickedLabel}</p>

                <div className="flex items-center">
                    <button type="button" className={navButton} aria-label="前の月" disabled={!canGoPrevious} onClick={() => setView(prevMonth)}>
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <p className="flex-1 text-center font-bold text-on-surface">
                        {view.year}/{String(view.month).padStart(2, "0")}
                    </p>
                    <button type="button" className={navButton} aria-label="次の月" disabled={!canGoNext} onClick={() => setView(nextMonth)}>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div>
                    <div className="grid grid-cols-7 mb-1">
                        {weekdayLabels().map((label) => (
                            <span key={label} className="text-xs text-on-surface-subtle text-center">{label}</span>
                        ))}
                    </div>
                    <div ref={gridRef} className="grid grid-cols-7 gap-0.5" role="grid">
                        {cells.map((cell) => {
                            const key = dateKey(cell.year, cell.month, cell.day);
                            const enabled = cell.inMonth && inRange(key);
                            const isPicked = key === picked;
                            const isToday = key === todayKey;
                            if (!cell.inMonth) return <span key={key} className={cellBase} aria-hidden="true" />;
                            const look = isPicked
                                ? "bg-primary text-on-primary font-bold"
                                : !enabled
                                  ? "text-on-surface/25 cursor-not-allowed"
                                  : `text-on-surface hover:bg-surface-container-high ${isToday ? "border-2 border-outline" : ""}`;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    data-key={key}
                                    disabled={!enabled}
                                    aria-pressed={isPicked}
                                    aria-label={`${cell.month}月${cell.day}日`}
                                    tabIndex={key === tabKey ? 0 : -1}
                                    onClick={() => select(key)}
                                    onKeyDown={(e) => onGridKeyDown(e, key)}
                                    className={`${cellBase} ${look}`}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="mr-1">時刻（日本時間）</span>
                    <select value={hour} onChange={(e) => { setHour(Number(e.target.value)); setError(null); }} aria-label="時" className={select_}>
                        {Array.from({ length: 24 }, (_, h) => (
                            <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                        ))}
                    </select>
                    <span>:</span>
                    <select value={minute} onChange={(e) => { setMinute(Number(e.target.value)); setError(null); }} aria-label="分" className={select_}>
                        {Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP).map((m) => (
                            <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                        キャンセル
                    </button>
                    <button type="button" onClick={handleDone} className="px-5 py-2 rounded-full text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors">
                        完了
                    </button>
                </div>
            </div>
        </div>
        </ModalPortal>
    );
}
