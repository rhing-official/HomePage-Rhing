// カレンダー（日付を選ぶ画面）の、画面に依存しない計算（2026-11-17）。DaiDaiアプリの
// `multi_date_picker_dialog.dart`（`_SelectableMonthGrid`・`_WeekdayHeaderRow`）と同じ考え方。
// 日付は、年・月・日の整数と、"YYYY-MM-DD"の文字列で扱い、`Date`は、UTCの日付の計算にだけ使う
// （タイムゾーンの影響を受けない。管理画面の削除の日時は日本時間として扱うため）。

export type WeekStart = "sunday" | "monday";

export interface CalendarCell {
    year: number;
    month: number; // 1〜12
    day: number;
    inMonth: boolean; // 表示中の月の日か（前後の月の余白は false）
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// 曜日（0=日曜〜6=土曜）
export function weekdayOf(year: number, month: number, day: number): number {
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function weekdayName(year: number, month: number, day: number): string {
    return WEEKDAYS[weekdayOf(year, month, day)];
}

// 曜日の見出し（週の始まりに合わせて並べる）
export function weekdayLabels(weekStart: WeekStart = "sunday"): string[] {
    return weekStart === "sunday" ? [...WEEKDAYS] : [...WEEKDAYS.slice(1), WEEKDAYS[0]];
}

export function dateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
    const [year, month, day] = key.split("-").map(Number);
    return { year, month, day };
}

export function addDays(key: string, delta: number): string {
    const { year, month, day } = parseDateKey(key);
    const d = new Date(Date.UTC(year, month - 1, day) + delta * DAY_MS);
    return dateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

// 月を、delta か月ずらす（1〜12にそろえる）
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
    const index = year * 12 + (month - 1) + delta;
    return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

// 1か月分のマス。前月の余白・当月・翌月の余白を、7の倍数（週ごと）にそろえる
export function monthCells(year: number, month: number, weekStart: WeekStart = "sunday"): CalendarCell[] {
    const firstWeekday = weekdayOf(year, month, 1);
    const leading = weekStart === "sunday" ? firstWeekday : (firstWeekday + 6) % 7;
    const total = Math.ceil((leading + daysInMonth(year, month)) / 7) * 7;
    const start = Date.UTC(year, month - 1, 1 - leading);
    const cells: CalendarCell[] = [];
    for (let i = 0; i < total; i++) {
        const d = new Date(start + i * DAY_MS);
        const cellMonth = d.getUTCMonth() + 1;
        cells.push({ year: d.getUTCFullYear(), month: cellMonth, day: d.getUTCDate(), inMonth: cellMonth === month });
    }
    return cells;
}
