import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({ doc: vi.fn(), getDoc: vi.fn() }));

import { shouldRecordView, type ViewStorage } from "./packStats";

function memoryStorage(): ViewStorage {
    const map = new Map<string, string>();
    return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

describe("shouldRecordView", () => {
    it("初回は真、同じ訪問の2回目は偽", () => {
        const s = memoryStorage();
        expect(shouldRecordView(s, "a")).toBe(true);
        expect(shouldRecordView(s, "a")).toBe(false);
    });
    it("別のパックは、別に数える", () => {
        const s = memoryStorage();
        expect(shouldRecordView(s, "a")).toBe(true);
        expect(shouldRecordView(s, "b")).toBe(true);
    });
    it("storageが使えないときは、数えない", () => {
        const broken: ViewStorage = {
            getItem: () => {
                throw new Error("denied");
            },
            setItem: () => {
                throw new Error("denied");
            },
        };
        expect(shouldRecordView(broken, "a")).toBe(false);
    });
});
