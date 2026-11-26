import { COLOR_LABELS, type ParsedThemePack, type ThemePackColorKey, type ThemePackColors } from "./spec";

// WCAG 2.x のコントラスト比。全ての組で、3:1以上にする（大きな文字・画面の部品の基準。AAの本文の基準は4.5:1）。
// 当初は4.5:1だったが、同梱の公式パック（桜 4.21、水玉 3.76）が届かないため、全ての組を3:1に緩めた（2026-11-26、ユーザー判断）。

export const MIN_CONTRAST_RATIO = 3;

function channel(v: number): number {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** `#RRGGBB` の相対輝度（0〜1） */
export function relativeLuminance(hex: string): number {
    const n = parseInt(hex.replace(/^#/, "").slice(0, 6), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 2色のコントラスト比（1〜21） */
export function contrastRatio(a: string, b: string): number {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

/** 検査する色の組。文字（前景）と、その下の色（背景） */
export const CONTRAST_PAIRS: { fg: ThemePackColorKey; bg: ThemePackColorKey }[] = [
    { fg: "text", bg: "background" },
    { fg: "text", bg: "panel" },
    { fg: "onAccent", bg: "accent" },
];

export type ContrastCheck = {
    scope: "light" | "dark";
    fg: ThemePackColorKey;
    bg: ThemePackColorKey;
    fgHex: string;
    bgHex: string;
    ratio: number;
    pass: boolean;
};

export type ContrastReport = {
    checks: ContrastCheck[];
    /** 片方の色が未指定で、検査できなかった組。アプリが版画の標準で導くため、横丁では確認できない */
    skipped: { scope: "light" | "dark"; fg: ThemePackColorKey; bg: ThemePackColorKey }[];
};

function scopesFor(brightness: ParsedThemePack["brightness"]): ("light" | "dark")[] {
    return brightness === "both" ? ["light", "dark"] : [brightness];
}

/** 明るさ別に（bothは両方）、両方の色が指定されている組だけを検査する */
export function checkContrast(pack: ParsedThemePack): ContrastReport {
    const checks: ContrastCheck[] = [];
    const skipped: ContrastReport["skipped"] = [];
    for (const scope of scopesFor(pack.brightness)) {
        const colors: ThemePackColors = pack.colors[scope];
        for (const { fg, bg } of CONTRAST_PAIRS) {
            const fgHex = colors[fg];
            const bgHex = colors[bg];
            if (!fgHex || !bgHex) {
                // 組のどちらも未指定なら、何も使っていないので、報告しない
                if (fgHex || bgHex) skipped.push({ scope, fg, bg });
                continue;
            }
            const ratio = contrastRatio(fgHex, bgHex);
            checks.push({ scope, fg, bg, fgHex, bgHex, ratio, pass: ratio >= MIN_CONTRAST_RATIO });
        }
    }
    return { checks, skipped };
}

/** 検査の結果を、投稿者向けの1行にする */
export function describeContrast(c: Pick<ContrastCheck, "scope" | "fg" | "bg" | "ratio">): string {
    const scope = c.scope === "light" ? "明るい外観" : "暗い外観";
    return `${scope}の「${COLOR_LABELS[c.fg]}」と「${COLOR_LABELS[c.bg]}」のコントラスト比は ${c.ratio.toFixed(2)} です`;
}
