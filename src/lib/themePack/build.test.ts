import { describe, expect, it } from "vitest";
import { buildPackJson, buildThemePackZip, emptyDraft, type ThemePackDraft } from "./build";
import { validateThemePackZip } from "./validate";
import { pngBytes } from "./testBytes";

const good = (): ThemePackDraft => ({
    ...emptyDraft(),
    id: "my-pack",
    name: "私の意匠",
    author: "誰か",
    colors: {
        light: { accent: "#C2185B", background: "#FFF1F5", panel: "#FDE3EB", text: "#3A1F2A", onAccent: "#FFFFFF", line: "#3A1F2A" },
        dark: { text: "#FFFFFF" },
    },
});

describe("意匠の組み立て", () => {
    it("組み立てたzipは、検査に通る", () => {
        const d: ThemePackDraft = {
            ...good(),
            brightness: "light",
            background: { ext: "png", bytes: pngBytes(1080, 1920) },
            menuChip: { bytes: pngBytes(128, 64) },
        };
        const r = validateThemePackZip(buildThemePackZip(d));
        expect(r.errors).toEqual([]);
        expect(r.ok).toBe(true);
        expect(r.pack?.menuChipImage).toBe("menu-chip.png");
        expect(r.pack?.backgroundImage).toBe("background.png");
    });

    it("使わない外観の色は書かない", () => {
        const json = JSON.parse(buildPackJson({ ...good(), brightness: "light" }));
        expect(json.colors.dark).toBeUndefined();
        expect(json.colors.light.accent).toBe("#C2185B");
    });

    it("空の色は書かない", () => {
        const json = JSON.parse(buildPackJson({ ...good(), brightness: "light", colors: { light: { accent: " ", text: "#000000" }, dark: {} } }));
        expect(json.colors.light).toEqual({ text: "#000000" });
    });

    it("idが不正なら、検査で落ちる", () => {
        const r = validateThemePackZip(buildThemePackZip({ ...good(), id: "Bad ID" }));
        expect(r.ok).toBe(false);
    });
});

describe("意匠の内部のid", () => {
    it("新しい下書きのidは、検査に通る形で、毎回違う", () => {
        const a = emptyDraft();
        const b = emptyDraft();
        expect(a.id).not.toBe(b.id);
        const r = validateThemePackZip(buildThemePackZip({ ...a, name: "名前" }));
        expect(r.errors).toEqual([]);
        expect(r.ok).toBe(true);
    });
});
