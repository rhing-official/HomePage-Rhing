import { describe, expect, it } from "vitest";
import { validateThemePackZip } from "./validate";
import { jpegBytes, makeZip, packJson, pngBytes, text, webpVp8xBytes } from "./testBytes";

const goodFiles = () => ({ "pack.json": text(packJson()), "background.png": pngBytes(1080, 1920) });

describe("意匠パックのzipの検査", () => {
    it("正常なパック（直下に置いたもの）は、合格", () => {
        const r = validateThemePackZip(makeZip(goodFiles()));
        expect(r.errors).toEqual([]);
        expect(r.ok).toBe(true);
        expect(r.pack?.id).toBe("test-pack");
        expect(r.background).toMatchObject({ file: "background.png", width: 1080, height: 1920 });
    });

    it("idと同じ名前のディレクトリの中に置いたものも、合格", () => {
        const r = validateThemePackZip(makeZip({ "test-pack/pack.json": text(packJson()), "test-pack/background.png": pngBytes(10, 10) }));
        expect(r.errors).toEqual([]);
        expect(r.ok).toBe(true);
    });

    it("ディレクトリの名前とidが違えば、不合格", () => {
        const r = validateThemePackZip(makeZip({ "other/pack.json": text(packJson()), "other/background.png": pngBytes(10, 10) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("一致しません");
    });

    it("macOSの不要なファイルは、無視する", () => {
        const r = validateThemePackZip(makeZip({ ...goodFiles(), "__MACOSX/._pack.json": text("x"), ".DS_Store": text("x") }));
        expect(r.ok).toBe(true);
        expect(r.warnings.join()).toContain("macOS");
    });

    it("pack.jsonが無ければ、不合格", () => {
        const r = validateThemePackZip(makeZip({ "background.png": pngBytes(10, 10) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("pack.json");
    });

    it("zipでないものは、不合格", () => {
        const r = validateThemePackZip(text("zipではありません"));
        expect(r.ok).toBe(false);
    });

    it("隠しファイルは、不合格", () => {
        const r = validateThemePackZip(makeZip({ ...goodFiles(), ".secret": text("x") }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("隠しファイル");
    });

    it.each(["run.sh", "setup.exe", "a.js", "x.py", "index.html", "icon.svg"])("実行形式・スクリプト・svg（%s）は、不合格", (name) => {
        const r = validateThemePackZip(makeZip({ ...goodFiles(), [name]: text("x") }));
        expect(r.ok).toBe(false);
    });

    it("子ディレクトリは、不合格", () => {
        const r = validateThemePackZip(makeZip({ ...goodFiles(), "sub/a.png": pngBytes(10, 10) }));
        expect(r.ok).toBe(false);
    });

    it("背景画像が、zipの中に無ければ、不合格", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson()) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("zipの中にありません");
    });

    it("画像の拡張子と中身が違えば、不合格", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson()), "background.png": jpegBytes(10, 10) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("一致しません");
    });

    it("画像でない中身は、不合格", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson()), "background.png": text("not an image at all, just text") }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("画像として読めません");
    });

    it("画像の辺が2048pxを超えれば、不合格。2048pxちょうどは合格", () => {
        const bad = validateThemePackZip(makeZip({ "pack.json": text(packJson()), "background.png": pngBytes(2049, 100) }));
        expect(bad.ok).toBe(false);
        const edge = validateThemePackZip(makeZip({ "pack.json": text(packJson()), "background.png": pngBytes(2048, 2048) }));
        expect(edge.ok).toBe(true);
    });

    it("画像1枚が2MBを超えれば、不合格", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson()), "background.png": pngBytes(100, 100, 2 * 1024 * 1024) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("容量");
    });

    it("zip全体が3MBを超えれば、不合格（展開しない）", () => {
        const big = makeZip({ "pack.json": text(packJson()), "a.png": pngBytes(10, 10, 1_900_000), "b.png": pngBytes(10, 10, 1_900_000) });
        const r = validateThemePackZip(big);
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("容量");
    });

    it("ファイルが21個以上なら、不合格", () => {
        const files: Record<string, Uint8Array> = { "pack.json": text(packJson()) };
        for (let i = 0; i < 20; i++) files[`img${i}.png`] = pngBytes(10, 10);
        const r = validateThemePackZip(makeZip(files));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("多すぎ");
    });

    it("使われていない画像は、警告にとどめる", () => {
        const r = validateThemePackZip(makeZip({ ...goodFiles(), "extra.webp": webpVp8xBytes(10, 10) }));
        expect(r.ok).toBe(true);
        expect(r.warnings.join()).toContain("extra.webp");
    });

    it("薄い背景に白い文字は、コントラストで不合格", () => {
        const bad = packJson({ colors: { light: { text: "#FFFFFF", background: "#FFF1F5" } } });
        const r = validateThemePackZip(makeZip({ "pack.json": text(bad), "background.png": pngBytes(10, 10) }));
        expect(r.ok).toBe(false);
        expect(r.errors.join()).toContain("コントラスト比");
    });

    it("範囲外の数値は、警告にとどめる", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson({ shape: { borderWidth: 99 } })), "background.png": pngBytes(10, 10) }));
        expect(r.ok).toBe(true);
        expect(r.warnings.join()).toContain("範囲外");
    });

    it("背景画像の指定が、危険なファイル名なら、不合格", () => {
        const r = validateThemePackZip(makeZip({ "pack.json": text(packJson({ images: { background: "../a.png" } })) }));
        expect(r.ok).toBe(false);
    });
});
