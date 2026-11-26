import { describe, expect, it } from "vitest";
import { normalizeHexColor, parseThemePack } from "./spec";

// 入力例は、DaiDai本体の test/theme_pack_test.dart に合わせている（規則の食い違いを防ぐ）
const json = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({ formatVersion: 1, id: "test-pack", name: "テスト", author: "誰か", brightness: "both", ...overrides });

function ok(source: string) {
    const r = parseThemePack(source);
    if (!r.ok) throw new Error(r.error);
    return r;
}

describe("意匠パックの読み取り", () => {
    it("正常なパックを読める", () => {
        const { pack, warnings } = ok(
            json({
                shape: { borderWidth: 3, radius: 12, shadowOffset: [5, 6] },
                colors: { light: { accent: "#112233", line: "#445566" }, dark: { background: "#000000" } },
                images: { background: "bg.webp" },
            }),
        );
        expect(pack.shape).toEqual({ borderWidth: 3, radius: 12, shadowOffset: [5, 6] });
        expect(pack.colors.light.accent).toBe("#112233");
        expect(pack.colors.light.line).toBe("#445566");
        expect(pack.colors.dark.background).toBe("#000000");
        expect(pack.backgroundImage).toBe("bg.webp");
        expect(warnings).toEqual([]);
    });

    it("範囲外の数値は、アプリと同じ値に丸め、警告を返す", () => {
        const { pack, warnings } = ok(json({ shape: { borderWidth: 99, radius: -5, shadowOffset: [100, -100] } }));
        expect(pack.shape).toEqual({ borderWidth: 6, radius: 0, shadowOffset: [12, -12] });
        expect(warnings).toHaveLength(3);
    });

    it("8桁の色は、透明度を捨てて不透明にし、警告を返す", () => {
        const { pack, warnings } = ok(json({ colors: { light: { accent: "#11223300" } } }));
        expect(pack.colors.light.accent).toBe("#112233");
        expect(warnings.some((w) => w.includes("透明度"))).toBe(true);
    });

    it("不正な色は、未指定として扱い、警告を返す", () => {
        const { pack, warnings } = ok(json({ colors: { light: { accent: "あか" } } }));
        expect(pack.colors.light.accent).toBeUndefined();
        expect(warnings).toHaveLength(1);
    });

    it("省略した項目は、既定値になる", () => {
        const { pack, warnings } = ok(json({}));
        expect(pack.shape).toEqual({ borderWidth: 2.5, radius: 8, shadowOffset: [4, 4] });
        expect(pack.colors.light.accent).toBeUndefined();
        expect(pack.backgroundImage).toBeUndefined();
        expect(warnings).toEqual([]);
    });

    it("brightnessは、不明な値ならbothになる", () => {
        expect(ok(json({ brightness: "dark" })).pack.brightness).toBe("dark");
        expect(ok(json({ brightness: "ふしぎ" })).pack.brightness).toBe("both");
    });

    it("名前は、前後の空白を除いて保存する", () => {
        expect(ok(json({ name: "  桜  " })).pack.name).toBe("桜");
    });

    it.each([
        ["壊れたJSON", "{"],
        ["配列", "[]"],
        ["formatVersionが新しい", json({ formatVersion: 99 })],
        ["formatVersionがnull", json({ formatVersion: null })],
        ["idにドットが入る", json({ id: "../x" })],
        ["idが大文字", json({ id: "Sakura" })],
        ["idが41文字", json({ id: "a".repeat(41) })],
        ["nameが空白だけ", json({ name: " " })],
        ["nameが41文字", json({ name: "あ".repeat(41) })],
    ])("読めない: %s", (_label, source) => {
        expect(parseThemePack(source).ok).toBe(false);
    });

    it.each(["../a.png", "/etc/passwd", "https://x/y.png", "a/b.png", "a b.png", "a.png.exe/x"])("背景画像として使えないファイル名: %s", (name) => {
        expect(parseThemePack(json({ images: { background: name } })).ok).toBe(false);
    });

    it("idは、1文字と40文字までなら使える", () => {
        expect(parseThemePack(json({ id: "a" })).ok).toBe(true);
        expect(parseThemePack(json({ id: "a".repeat(40) })).ok).toBe(true);
    });
});

describe("色の読み取り", () => {
    it("#の有無・大文字小文字・前後の空白を受け付ける", () => {
        expect(normalizeHexColor("d6457a")).toEqual({ hex: "#D6457A", hadAlpha: false });
        expect(normalizeHexColor("  #D6457A ")).toEqual({ hex: "#D6457A", hadAlpha: false });
        expect(normalizeHexColor("#d6457aff")).toEqual({ hex: "#D6457A", hadAlpha: true });
    });
    it("桁数や文字が違えば、null", () => {
        expect(normalizeHexColor("#FFF")).toBeNull();
        expect(normalizeHexColor("#GGGGGG")).toBeNull();
        expect(normalizeHexColor("")).toBeNull();
    });
});
