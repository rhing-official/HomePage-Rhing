import { NextRequest, NextResponse } from "next/server";

// 元々ContactForm.tsxでクライアントから直接no-cors POSTしていたGAS Webアプリ
// のURL。reCAPTCHA検証をサーバーサイドで挟むため、このAPI Route経由に変更した
// （2026-09-11）。CONTACT_GAS_WEBAPP_URLで上書き可能。
const GAS_URL =
    process.env.CONTACT_GAS_WEBAPP_URL ??
    "https://script.google.com/macros/s/AKfycbWxNCo2T3awUeDQ4WIAu1wa_IWgrl9MmNHooH3MLKmraQOrhiCBvW8_9AbdmaNI6iU/exec";

// reCAPTCHA v3はスコア(0.0〜1.0、1.0が人間らしい)で判定する。0.5はGoogle公式ドキュメントの目安値。
const RECAPTCHA_SCORE_THRESHOLD = 0.5;
const RECAPTCHA_ACTION = "contact";

interface ContactRequestBody {
    activeTab: "user" | "business";
    fields: Record<string, string>;
    attachmentUrls: string[];
    recaptchaToken: string;
    botcheck: string;
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ContactRequestBody;

    // ハニーポット（botcheck）が埋まっている場合はスパムボット対策として
    // 送信成功を装い中断する（従来のクライアント側実装と同じ挙動）。
    if (body.botcheck) {
        return NextResponse.json({ success: true });
    }

    if (!body.recaptchaToken) {
        return NextResponse.json({ success: false, error: "recaptcha_missing" }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY が未設定です");
        return NextResponse.json({ success: false, error: "server_misconfigured" }, { status: 500 });
    }

    const verifyParams = new URLSearchParams({
        secret: secretKey,
        response: body.recaptchaToken,
    });
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyParams.toString(),
    });
    const verifyData = (await verifyRes.json()) as {
        success: boolean;
        score?: number;
        action?: string;
    };

    if (
        !verifyData.success ||
        verifyData.action !== RECAPTCHA_ACTION ||
        (verifyData.score ?? 0) < RECAPTCHA_SCORE_THRESHOLD
    ) {
        return NextResponse.json({ success: false, error: "recaptcha_failed" }, { status: 400 });
    }

    const gasParams = new URLSearchParams();
    for (const [key, value] of Object.entries(body.fields)) {
        gasParams.append(key, value);
    }
    gasParams.append("activeTab", body.activeTab);
    if (body.attachmentUrls.length > 0) {
        gasParams.append("添付画像URL", body.attachmentUrls.join(", "));
    }

    try {
        const gasRes = await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: gasParams.toString(),
        });
        if (!gasRes.ok) {
            console.error("GAS送信に失敗:", gasRes.status, await gasRes.text());
            return NextResponse.json({ success: false, error: "gas_failed" }, { status: 502 });
        }
    } catch (error) {
        console.error("GAS送信エラー:", error);
        return NextResponse.json({ success: false, error: "gas_error" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
}
