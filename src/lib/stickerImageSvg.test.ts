// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeSvg } from "./stickerImageSpec";

const svg = (inner: string, attrs = "") => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 10 10"${attrs}>${inner}</svg>`;

describe("sanitizeSvg", () => {
    it("安全な図形の要素と属性は、そのまま残る", () => {
        const out = sanitizeSvg(svg('<rect x="1" y="2" width="3" height="4" fill="#f00"/><circle cx="5" cy="5" r="2"/>'))!;
        expect(out).toContain('<rect x="1" y="2" width="3" height="4" fill="#f00"');
        expect(out).toContain("<circle");
    });

    it("scriptを取り除く", () => {
        const out = sanitizeSvg(svg('<script>alert(1)</script><rect width="1" height="1"/>'))!;
        expect(out).not.toContain("script");
        expect(out).not.toContain("alert");
        expect(out).toContain("<rect");
    });

    it.each(["foreignObject", "iframe", "object", "embed"])("%sを取り除く", (tag) => {
        const out = sanitizeSvg(svg(`<${tag}><p>x</p></${tag}><rect width="1" height="1"/>`))!;
        expect(out).not.toContain(tag);
        expect(out).toContain("<rect");
    });

    it("on*属性を取り除く（ルートにも付く）", () => {
        const out = sanitizeSvg(svg('<rect width="1" height="1" onclick="x()" onmouseover="y()"/>', ' onload="z()"'))!;
        expect(out).not.toMatch(/\son[a-z]+=/i);
        expect(out).toContain("<rect");
    });

    it("外部URLを指すhrefを取り除く", () => {
        const out = sanitizeSvg(svg('<a href="https://example.com/x"><rect width="1" height="1"/></a><image xlink:href="http://example.com/a.png"/>'))!;
        expect(out).not.toContain("example.com");
    });

    it("javascript:を含む値を取り除く", () => {
        const out = sanitizeSvg(svg('<a href="javascript:alert(1)"><rect width="1" height="1"/></a><rect style="fill:url(javascript:x)" width="1" height="1"/>'))!;
        expect(out).not.toContain("javascript:");
    });

    it("#始まりの参照と、画像のdata URLは残す", () => {
        const png = "data:image/png;base64,AAAA";
        const out = sanitizeSvg(svg(`<defs><linearGradient id="g"/></defs><use href="#g"/><image href="${png}" width="1" height="1"/>`))!;
        expect(out).toContain('href="#g"');
        expect(out).toContain(png);
    });

    it("画像以外のdata URL（svg+xml、htmlなど）は取り除く", () => {
        const out = sanitizeSvg(svg('<image href="data:text/html;base64,PHNjcmlwdD4=" width="1" height="1"/><image href="data:image/svg+xml;base64,AAAA" width="1" height="1"/>'))!;
        expect(out).not.toContain("data:");
    });

    it("SVGでない入力は、nullを返す", () => {
        expect(sanitizeSvg("<html><body>x</body></html>")).toBeNull();
        expect(sanitizeSvg("hello")).toBeNull();
        expect(sanitizeSvg("")).toBeNull();
    });

    it("壊れたXMLは、nullを返す", () => {
        expect(sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect></svg>')).toBeNull();
    });
});
