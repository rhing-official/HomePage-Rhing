import { afterEach, describe, expect, it, vi } from "vitest";
import { createTotpClipboardAutofill, parseTotpCode } from "./totpAutofill";

describe("parseTotpCode", () => {
    it.each([
        ["123456", "123456"],
        ["123 456", "123456"],
        ["123-456", "123456"],
        ["１２３４５６", "123456"],
        ["  123456\n", "123456"],
    ])("%j から6桁を取り出す", (input, expected) => {
        expect(parseTotpCode(input)).toBe(expected);
    });

    it.each([["12345"], ["1234567"], ["abc123"], ["code: 123456"], ["123456 code"], [""], ["   "]])(
        "%j は無視する",
        (input) => {
            expect(parseTotpCode(input)).toBeNull();
        },
    );

    it("nullとundefinedは無視する", () => {
        expect(parseTotpCode(null)).toBeNull();
        expect(parseTotpCode(undefined)).toBeNull();
    });
});

function setup(initial = "123456") {
    const state = { clipboard: initial, active: true };
    const readText = vi.fn(async () => state.clipboard);
    const onCode = vi.fn();
    const autofill = createTotpClipboardAutofill({ readText, isActive: () => state.active, onCode });
    return { state, readText, onCode, autofill };
}

describe("createTotpClipboardAutofill", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("6桁なら採用して1回だけ確定する", async () => {
        const { autofill, onCode } = setup("123456");
        await autofill.check();
        expect(onCode).toHaveBeenCalledTimes(1);
        expect(onCode).toHaveBeenCalledWith("123456");
    });

    it("同じクリップボードのまま再確認しても、2回目は呼ばれない", async () => {
        const { autofill, onCode } = setup("123456");
        await autofill.check();
        await autofill.check();
        expect(onCode).toHaveBeenCalledTimes(1);
    });

    it("クリップボードの値が変われば、再度呼ばれる", async () => {
        const { autofill, onCode, state } = setup("123456");
        await autofill.check();
        state.clipboard = "654321";
        await autofill.check();
        expect(onCode).toHaveBeenCalledTimes(2);
        expect(onCode).toHaveBeenLastCalledWith("654321");
    });

    it("6桁以外や空のクリップボードでは何も起きない", async () => {
        const { autofill, onCode, state } = setup("12345");
        await autofill.check();
        state.clipboard = "";
        await autofill.check();
        state.clipboard = "code: 123456";
        await autofill.check();
        expect(onCode).not.toHaveBeenCalled();
    });

    it("入力欄が有効でない間は、クリップボードを読まない", async () => {
        const { autofill, onCode, readText, state } = setup("123456");
        state.active = false;
        await autofill.check();
        expect(readText).not.toHaveBeenCalled();
        expect(onCode).not.toHaveBeenCalled();
    });

    it("確認を同時に2回呼んでも、確定は1回だけ", async () => {
        const { autofill, onCode, readText } = setup("123456");
        await Promise.all([autofill.check(), autofill.check()]);
        expect(readText).toHaveBeenCalledTimes(1);
        expect(onCode).toHaveBeenCalledTimes(1);
    });

    it("読み取り中に入力欄が無効になったら、採用しない", async () => {
        const state = { active: true };
        const onCode = vi.fn();
        const readText = vi.fn(async () => {
            state.active = false; // 読み取り中に確定処理が始まった想定
            return "123456";
        });
        const guarded = createTotpClipboardAutofill({ readText, isActive: () => state.active, onCode });
        await guarded.check();
        expect(onCode).not.toHaveBeenCalled();
    });

    it("読み取りで例外が出ても握りつぶし、その表示中は再度読まない", async () => {
        const onCode = vi.fn();
        const readText = vi.fn(async () => {
            throw new DOMException("denied", "NotAllowedError");
        });
        const autofill = createTotpClipboardAutofill({ readText, isActive: () => true, onCode });
        await expect(autofill.check()).resolves.toBeUndefined();
        await autofill.check();
        await autofill.check();
        expect(readText).toHaveBeenCalledTimes(1);
        expect(onCode).not.toHaveBeenCalled();
    });

    it("新しい表示（startSession）では、拒否済みの状態が解除され、再び読める", async () => {
        let allow = false;
        const onCode = vi.fn();
        const readText = vi.fn(async () => {
            if (!allow) throw new Error("denied");
            return "123456";
        });
        const autofill = createTotpClipboardAutofill({ readText, isActive: () => true, onCode });
        await autofill.check();
        allow = true;
        await autofill.check();
        expect(onCode).not.toHaveBeenCalled(); // 拒否済みなので読まない
        autofill.startSession();
        await autofill.check();
        expect(onCode).toHaveBeenCalledWith("123456");
    });

    it("startSessionの後も、直前に自動入力したコードでは繰り返さない", async () => {
        const { autofill, onCode } = setup("123456");
        await autofill.check();
        autofill.startSession();
        await autofill.check();
        expect(onCode).toHaveBeenCalledTimes(1);
    });

    it("読んだ文字列を、ログに出さない", async () => {
        const spies = (["log", "info", "warn", "error", "debug"] as const).map((m) =>
            vi.spyOn(console, m).mockImplementation(() => {}),
        );
        const { autofill } = setup("123456");
        await autofill.check();
        for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    });
});
