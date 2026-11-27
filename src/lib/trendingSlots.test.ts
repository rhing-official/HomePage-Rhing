import { describe, expect, it } from "vitest";
import { pickTrendingSlots } from "./trendingSlots";

describe("pickTrendingSlots", () => {
    it("ぺったん3・意匠2に分ける", () => {
        const r = pickTrendingSlots(["p1", "p2", "p3", "p4", "p5"], ["d1", "d2", "d3"]);
        expect(r).toEqual({ petan: ["p1", "p2", "p3"], designs: ["d1", "d2"] });
    });
    it("意匠が足りない間は、ぺったんで埋める", () => {
        expect(pickTrendingSlots(["p1", "p2", "p3", "p4", "p5"], ["d1"])).toEqual({ petan: ["p1", "p2", "p3", "p4"], designs: ["d1"] });
        expect(pickTrendingSlots(["p1", "p2", "p3", "p4", "p5"], [])).toEqual({ petan: ["p1", "p2", "p3", "p4", "p5"], designs: [] });
    });
    it("ぺったんが足りなくても、意匠で埋めない", () => {
        expect(pickTrendingSlots(["p1"], ["d1", "d2", "d3"])).toEqual({ petan: ["p1"], designs: ["d1", "d2"] });
    });
});
