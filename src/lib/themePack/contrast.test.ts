import { describe, expect, it } from "vitest";
import { checkContrast, contrastRatio, relativeLuminance } from "./contrast";
import type { ParsedThemePack } from "./spec";

const pack = (overrides: Partial<ParsedThemePack> = {}): ParsedThemePack => ({
    formatVersion: 1,
    id: "t",
    name: "t",
    author: "",
    brightness: "light",
    shape: { borderWidth: 2.5, radius: 8, shadowOffset: [4, 4] },
    colors: { light: {}, dark: {} },
    ...overrides,
});

describe("コントラスト比", () => {
    it("黒と白は21、同じ色は1", () => {
        expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
        expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
    });
    it("順序に関わらず同じ", () => {
        expect(contrastRatio("#FFFFFF", "#777777")).toBeCloseTo(contrastRatio("#777777", "#FFFFFF"), 10);
    });
    it("相対輝度の端", () => {
        expect(relativeLuminance("#000000")).toBe(0);
        expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
    });
    it("グレー#767676と白は、AAの境目（約4.54）", () => {
        expect(contrastRatio("#767676", "#FFFFFF")).toBeGreaterThan(4.5);
        expect(contrastRatio("#777777", "#FFFFFF")).toBeLessThan(4.5);
    });
});

describe("パックのコントラスト検査", () => {
    it("薄い背景に白い文字は、不合格", () => {
        const r = checkContrast(pack({ colors: { light: { text: "#FFFFFF", background: "#FFF1F5" }, dark: {} } }));
        expect(r.checks).toHaveLength(1);
        expect(r.checks[0].pass).toBe(false);
    });
    it("読みやすい配色は、全ての組で合格", () => {
        const r = checkContrast(
            pack({
                colors: {
                    light: { accent: "#C2185B", background: "#FFF1F5", panel: "#FDE3EB", text: "#3A1F2A", onAccent: "#FFFFFF", line: "#3A1F2A" },
                    dark: {},
                },
            }),
        );
        expect(r.checks).toHaveLength(3);
        expect(r.checks.every((c) => c.pass)).toBe(true);
    });
    it("同梱の公式パック「桜」は、強調色と文字が4.21で、基準（3）を満たす", () => {
        const r = checkContrast(
            pack({
                colors: {
                    light: { accent: "#D6457A", background: "#FFF1F5", panel: "#FDE3EB", text: "#3A1F2A", onAccent: "#FFFFFF", line: "#3A1F2A" },
                    dark: {},
                },
            }),
        );
        expect(r.checks.find((c) => c.fg === "onAccent")?.ratio).toBeCloseTo(4.21, 2);
        expect(r.checks.every((c) => c.pass)).toBe(true);
    });
    it("基準（3）の境目。#949494と白は約3.03で合格、#959595は不合格", () => {
        expect(contrastRatio("#949494", "#FFFFFF")).toBeGreaterThanOrEqual(3);
        expect(contrastRatio("#959595", "#FFFFFF")).toBeLessThan(3);
        expect(checkContrast(pack({ colors: { light: { text: "#949494", background: "#FFFFFF" }, dark: {} } })).checks[0].pass).toBe(true);
        expect(checkContrast(pack({ colors: { light: { text: "#959595", background: "#FFFFFF" }, dark: {} } })).checks[0].pass).toBe(false);
    });
    it("bothなら、明るい外観と暗い外観の両方を検査する", () => {
        const r = checkContrast(
            pack({ brightness: "both", colors: { light: { text: "#000000", background: "#FFFFFF" }, dark: { text: "#000000", background: "#111111" } } }),
        );
        expect(r.checks.map((c) => [c.scope, c.pass])).toEqual([
            ["light", true],
            ["dark", false],
        ]);
    });
    it("lightだけのパックは、暗い外観の色を検査しない", () => {
        const r = checkContrast(pack({ brightness: "light", colors: { light: {}, dark: { text: "#000000", background: "#000000" } } }));
        expect(r.checks).toHaveLength(0);
    });
    it("片方の色だけが書かれた組は、検査できないものとして返す", () => {
        const r = checkContrast(pack({ colors: { light: { text: "#000000" }, dark: {} } }));
        expect(r.checks).toHaveLength(0);
        expect(r.skipped).toEqual([
            { scope: "light", fg: "text", bg: "background" },
            { scope: "light", fg: "text", bg: "panel" },
        ]);
    });
    it("何も書かれていない組は、報告しない", () => {
        const r = checkContrast(pack());
        expect(r.checks).toHaveLength(0);
        expect(r.skipped).toHaveLength(0);
    });
});
