import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./themePack/contrast";

// globals.cssの色トークン（ライトは@theme、ダークは.dark）の、文字と背景の組のコントラストを確かめる。
// 本文の基準は4.5:1（WCAG AA）。

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function block(startPattern: RegExp): string {
    const m = startPattern.exec(css);
    if (!m) throw new Error(`${startPattern}が見つかりません`);
    let depth = 0;
    for (let i = m.index + m[0].length - 1; i < css.length; i++) {
        if (css[i] === "{") depth++;
        if (css[i] === "}" && --depth === 0) return css.slice(m.index, i);
    }
    throw new Error("括弧が閉じていません");
}

function tokens(body: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const m of body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2];
    return out;
}

const light = tokens(block(/@theme\s*\{/));
const dark = { ...light, ...tokens(block(/\.dark\s*\{/)) };

const PAIRS: [string, string][] = [
    ["on-surface", "surface"],
    ["on-surface", "surface-container"],
    ["on-surface", "surface-container-lowest"],
    ["on-surface", "surface-container-high"],
    ["on-surface-variant", "surface"],
    ["on-surface-variant", "surface-container-lowest"],
    ["on-primary", "primary"],
    ["on-primary-container", "primary-container"],
    ["on-secondary-container", "secondary-container"],
    ["on-surface", "secondary-container"],
    ["primary", "surface"],
    ["primary", "surface-container-lowest"],
    ["error", "surface"],
    ["vermilion", "surface"],
];

describe.each([
    ["ライト", light],
    ["ダーク", dark],
] as const)("%sの色トークンのコントラスト", (_name, t) => {
    it.each(PAIRS)("%s と %s は、3:1以上", (fg, bg) => {
        expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
    });
    it.each(PAIRS.filter(([fg]) => ["on-surface", "on-surface-variant", "on-primary", "on-primary-container", "on-secondary-container"].includes(fg)))(
        "本文の組 %s と %s は、4.5:1以上",
        (fg, bg) => {
            expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
        },
    );
});

it("ダークは、ライトの全ての色トークンを持つ", () => {
    const darkOnly = tokens(block(/\.dark\s*\{/));
    for (const k of Object.keys(light)) expect(darkOnly[k], k).toBeDefined();
});

// ライトのtertiary（#ee7800）は、既存の色で、飾りに使う。ダークでは、読める値にしてある
it("ダークのtertiaryは、surfaceの上で3:1以上", () => {
    expect(contrastRatio(dark.tertiary, dark.surface)).toBeGreaterThanOrEqual(3);
});

it(".force-lightは、ライトの値と一致する（ダークの中でもライトで表示する場所用）", () => {
    expect(tokens(block(/\.force-light\s*\{/))).toEqual(light);
});

// ダークのフッター（.dark .force-light）は、ライトの値に、桃色だけを重ねる。文字は、ライトの色のまま
it("ダークのフッターの、桃色と文字は、4.5:1以上", () => {
    const footer = { ...light, ...tokens(block(/\.dark \.force-light\s*\{/)) };
    expect(footer["secondary-container"]).toBe("#bf9088");
    expect(contrastRatio(footer["on-surface"], footer["secondary-container"])).toBeGreaterThanOrEqual(4.5);
});
