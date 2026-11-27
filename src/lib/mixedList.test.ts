import { describe, expect, it } from "vitest";
import { itemKey, mergeByAddedAt, parseItemKey, timestampToMillis, type MixedItem } from "./mixedList";

const item = (kind: "petan" | "design", id: string, addedAt: number): MixedItem<null> => ({ kind, id, addedAt, data: null });

describe("mergeByAddedAt", () => {
    it("追加した新しい順に、種別をまたいで並べる", () => {
        const r = mergeByAddedAt([item("petan", "a", 10), item("petan", "b", 30)], [item("design", "x", 20)]);
        expect(r.map((i) => i.id)).toEqual(["b", "x", "a"]);
    });
    it("時刻が同じ（または無い）ものは、ぺったんを先にし、元の並びを保つ", () => {
        const r = mergeByAddedAt([item("petan", "a", 0), item("petan", "b", 0)], [item("design", "x", 0), item("design", "y", 0)]);
        expect(r.map((i) => i.id)).toEqual(["a", "b", "x", "y"]);
    });
});

describe("itemKey", () => {
    it("種別とidを、行き来できる", () => {
        expect(parseItemKey(itemKey("design", "u__sakura"))).toEqual({ kind: "design", id: "u__sakura" });
        expect(parseItemKey(itemKey("petan", "a:b"))).toEqual({ kind: "petan", id: "a:b" });
    });
});

describe("timestampToMillis", () => {
    it("Timestampはミリ秒に、nullや不明は0にする", () => {
        expect(timestampToMillis({ toMillis: () => 123 })).toBe(123);
        expect(timestampToMillis(null)).toBe(0);
        expect(timestampToMillis({})).toBe(0);
    });
});
