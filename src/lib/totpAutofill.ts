// 2段階認証（TOTP）の6桁コードを、クリップボードから自動入力・自動確定するためのロジック。
// DaiDaiアプリ側の`TotpClipboardAutofill`と同じ仕様（Reactに依存しない形で実装し、テストできるようにしている）。
//
// プライバシー: クリップボードから読んだ文字列は、6桁のコードとして確定に使う以外の用途に
// 使わない。保存・送信・ログ出力をしない（エラー監視にも載せない）。

/** 全角数字（U+FF10〜U+FF19）を半角に直す。 */
export function toHalfWidthDigits(input: string): string {
    let out = "";
    for (const ch of input) {
        const code = ch.codePointAt(0)!;
        out += code >= 0xff10 && code <= 0xff19 ? String.fromCodePoint(code - 0xfee0) : ch;
    }
    return out;
}

/**
 * クリップボードの文字列から、認証アプリ（TOTP）の6桁コードを取り出す。
 * 全角数字は半角にし、空白・ハイフンは取り除く。ちょうど6桁の数字でなければnull。
 */
export function parseTotpCode(clipboardText: string | null | undefined): string | null {
    if (clipboardText == null) return null;
    const normalized = toHalfWidthDigits(clipboardText.trim()).replace(/[\s-]/g, "");
    return /^\d{6}$/.test(normalized) ? normalized : null;
}

export type TotpClipboardAutofillOptions = {
    /** クリップボードの文字列を読む。権限拒否や未対応のときは例外を投げてよい */
    readText: () => Promise<string>;
    /** 6桁の入力欄が表示されていて、確定処理中でない時だけtrue */
    isActive: () => boolean;
    /** 6桁のコードを採用した時に呼ばれる（ここで入力欄に入れて確定する） */
    onCode: (code: string) => void;
};

export function createTotpClipboardAutofill({ readText, isActive, onCode }: TotpClipboardAutofillOptions) {
    let lastAutofilled: string | null = null; // 直前に自動入力したコード（同じ値では繰り返さない）
    let checking = false; // 確認中の二重実行を防ぐ
    let denied = false; // 権限拒否などで読めないと判明したら、その表示中は再度読まない

    return {
        /** 入力欄が新たに表示された時に呼ぶ。拒否済みの状態を解除する（直前のコードは保持する） */
        startSession() {
            denied = false;
        },

        /** クリップボードを1回読み、6桁のコードがあれば採用する。失敗は黙って無視する */
        async check(): Promise<void> {
            if (checking || denied || !isActive()) return;
            checking = true;
            try {
                let text: string;
                try {
                    text = await readText();
                } catch {
                    denied = true; // 例外は全て握りつぶし、手入力に任せる
                    return;
                }
                if (!isActive()) return;
                const code = parseTotpCode(text);
                if (code === null || code === lastAutofilled) return;
                lastAutofilled = code;
                onCode(code);
            } finally {
                checking = false;
            }
        },
    };
}
