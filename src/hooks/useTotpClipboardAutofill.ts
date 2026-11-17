"use client";

import { useEffect, useRef } from "react";
import { createTotpClipboardAutofill } from "@/lib/totpAutofill";

// クリップボードの文字列を読む。権限拒否・未対応（navigator.clipboard.readTextが無い）の
// 場合は例外になり、totpAutofill側で握りつぶして手入力に任せる。
const readClipboardText = () => navigator.clipboard.readText();

// ブラウザの権限が「拒否」と分かっているときだけtrue。権限の状態を調べられないブラウザ（Firefox・Safari）はfalse
const isClipboardBlocked = async () => {
    try {
        const status = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
        return status.state === "denied";
    } catch {
        return false;
    }
};

/**
 * 2段階認証（TOTP）の6桁コードの入力欄が表示されている間だけ、クリップボードの6桁を
 * 自動採用する。確認するのは、入力欄が表示された直後（描画後に1回）と、タブ・ウィンドウが
 * 前面に戻った時（visibilitychangeでvisible、またはwindowのfocus）だけ。
 *
 * active: 入力欄が表示されていて、確定処理中でない時だけtrue
 * onCode: 6桁のコードを採用した時に呼ばれる（入力欄に入れて確定する）
 */
export function useTotpClipboardAutofill({ active, onCode }: { active: boolean; onCode: (code: string) => void }) {
    // 最新の値を、イベントや非同期処理の中から読めるようにする
    const activeRef = useRef(active);
    const onCodeRef = useRef(onCode);
    useEffect(() => {
        activeRef.current = active;
        onCodeRef.current = onCode;
    });

    // 制御オブジェクトは、マウント時に一度だけ作り、表示のたびに作り直さない。
    // 「直前に自動入力したコード」を保持し続け、コードが間違い・期限切れで送信中の状態を
    // 抜けた時に、同じコードを繰り返し送らないようにするため（ref/関数は、描画中ではなくエフェクト内で扱う）。
    const autofillRef = useRef<ReturnType<typeof createTotpClipboardAutofill> | null>(null);
    useEffect(() => {
        autofillRef.current = createTotpClipboardAutofill({
            readText: readClipboardText,
            isActive: () => activeRef.current,
            onCode: (code) => onCodeRef.current(code),
            isBlocked: isClipboardBlocked,
        });
    }, []);

    useEffect(() => {
        const autofill = autofillRef.current;
        if (!active || !autofill) return;
        autofill.startSession();
        void autofill.check(); // 表示された直後（描画後）に1回

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") void autofill.retry();
        };
        const onFocus = () => void autofill.retry();
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("focus", onFocus);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("focus", onFocus);
        };
    }, [active]);
}
