import { describe, expect, it } from "vitest";
import { arcPoint } from "@/lib/flyToChip";

describe("arcPoint", () => {
    const from = { x: 100, y: 400 };
    const to = { x: 300, y: 100 };

    it("t=0 は始点、t=1 は終点", () => {
        expect(arcPoint(from, to, 0)).toEqual(from);
        const end = arcPoint(from, to, 1);
        expect(end.x).toBeCloseTo(to.x);
        expect(end.y).toBeCloseTo(to.y);
    });

    it("途中は、始点と終点を結ぶ直線より、画面の上にふくらむ", () => {
        const mid = arcPoint(from, to, 0.5);
        const lineY = (from.y + to.y) / 2;
        expect(mid.y).toBeLessThan(lineY);
    });

    it("x は、始点から終点へ、単調に近づく", () => {
        let prev = -Infinity;
        for (let i = 0; i <= 10; i++) {
            const p = arcPoint(from, to, i / 10);
            expect(p.x).toBeGreaterThanOrEqual(prev);
            prev = p.x;
        }
    });
});
