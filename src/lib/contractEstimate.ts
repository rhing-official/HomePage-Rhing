// 受託開発の見積もり（目安）。料金はここにまとめてあるので、変更するときはこのファイルだけを直す。
// 元資料のプランに無い組み合わせ（2〜3ページ、アプリの画面数など）は、考え方を補って決めた案。

export interface EstimateLine {
    label: string;
    amount: number;
}

export interface Estimate {
    total: number;
    lines: EstimateLine[];
    // 制作期間の目安（日）
    days: number;
    // 合計に入らない項目（別途見積もりなど）の説明
    notes: string[];
    // 上限を超えていて、個別のご相談になる
    needsConsult: boolean;
}

export const WEB_PRICING = {
    onePage: { price: 27_500, days: 14 },
    fourPages: { price: 44_000, days: 30 },
    extraPage: { price: 10_000, days: 5 },
    branchingForm: 22_000,
    // ログインと会員限定ページ（Firebaseの無料枠で運用）
    membership: { price: 55_000, days: 10 },
    maxPages: 20,
};

export const APP_PRICING = {
    web: { price: 100_000, days: 30, includedScreens: 3 },
    webAndroid: { price: 200_000, days: 45, includedScreens: 5 },
    extraScreen: { price: 20_000, days: 5 },
    storeSupport: 30_000,
    // 会員機能（ログインとデータ保存）。Androidを含むプランには、最初から含まれる
    membership: { price: 50_000, days: 10 },
    maxScreens: 20,
};

export interface WebSelection {
    pages: number;
    branchingForm: boolean;
    membership: boolean;
}

export function estimateWeb({ pages, branchingForm, membership }: WebSelection): Estimate {
    const n = Math.max(1, Math.floor(pages));
    const lines: EstimateLine[] = [];
    const notes: string[] = [];
    let days: number;

    if (n === 1) {
        lines.push({ label: "1ページ", amount: WEB_PRICING.onePage.price });
        days = WEB_PRICING.onePage.days;
    } else {
        lines.push({ label: "2〜4ページ（4ページまで同額）", amount: WEB_PRICING.fourPages.price });
        days = WEB_PRICING.fourPages.days;
        if (n > 4) {
            const extra = n - 4;
            lines.push({ label: `ページ追加 ${extra}ページ`, amount: extra * WEB_PRICING.extraPage.price });
            days += extra * WEB_PRICING.extraPage.days;
        }
    }
    if (branchingForm) {
        lines.push({ label: "条件分岐フォーム", amount: WEB_PRICING.branchingForm });
    }
    if (membership) {
        lines.push({ label: "会員機能（ログイン・会員限定ページ）", amount: WEB_PRICING.membership.price });
        days += WEB_PRICING.membership.days;
    }

    const needsConsult = n > WEB_PRICING.maxPages;
    if (needsConsult) notes.push(`${WEB_PRICING.maxPages}ページを超える場合は、個別にご相談ください。`);
    return { total: lines.reduce((sum, l) => sum + l.amount, 0), lines, days, notes, needsConsult };
}

export type AppPlatform = "web" | "android" | "ios" | "macos" | "windows" | "linux";

// 動作環境。priced=trueは料金表にある環境（Web・Android）。それ以外は、別途お見積もり
export const APP_PLATFORMS: { id: AppPlatform; label: string; priced: boolean }[] = [
    { id: "web", label: "Web", priced: true },
    { id: "android", label: "Android", priced: true },
    { id: "ios", label: "iOS", priced: false },
    { id: "macos", label: "macOS", priced: false },
    { id: "windows", label: "Windows", priced: false },
    { id: "linux", label: "Linux", priced: false },
];

export interface AppSelection {
    platforms: AppPlatform[];
    screens: number;
    storeSupport: boolean;
    membership: boolean;
}

export function estimateApp({ platforms, screens, storeSupport, membership }: AppSelection): Estimate {
    const n = Math.max(1, Math.floor(screens));
    const hasAndroid = platforms.includes("android");
    const hasWeb = platforms.includes("web");
    // Androidを含むときは「Web＋Android」の料金、Webだけのときは「Web」の料金
    const base = hasAndroid ? APP_PRICING.webAndroid : APP_PRICING.web;
    const lines: EstimateLine[] = [
        {
            label: `${hasAndroid ? (hasWeb ? "Web＋Androidアプリ" : "Androidアプリ") : "Webアプリ"}（画面${base.includedScreens}つまで）`,
            amount: base.price,
        },
    ];
    const notes: string[] = [];
    let days = base.days;

    if (n > base.includedScreens) {
        const extra = n - base.includedScreens;
        lines.push({ label: `画面追加 ${extra}画面`, amount: extra * APP_PRICING.extraScreen.price });
        days += extra * APP_PRICING.extraScreen.days;
    }
    // ストアへの公開は、Android（Google Play）のときだけ
    if (storeSupport && hasAndroid) {
        lines.push({ label: "ストア公開サポート", amount: APP_PRICING.storeSupport });
    }

    // 会員機能は、Androidを含むプランには含まれるので、Webだけのときに足す
    if (membership && !hasAndroid) {
        lines.push({ label: "会員機能（ログイン・データ保存）", amount: APP_PRICING.membership.price });
        days += APP_PRICING.membership.days;
    }

    const unpriced = APP_PLATFORMS.filter((p) => !p.priced && platforms.includes(p.id)).map((p) => p.label);
    if (unpriced.length > 0) notes.push(`${unpriced.join("・")}対応は、別途お見積もりです（合計には含みません）。`);

    // WebもAndroidも選んでいないときは、料金表にない環境だけなので、個別のご相談になる
    let needsConsult = !hasWeb && !hasAndroid;
    if (needsConsult) notes.push("Web・Android以外のみの場合は、個別にご相談ください（上の金額は、Webアプリとしての目安です）。");
    if (n > APP_PRICING.maxScreens) {
        needsConsult = true;
        notes.push(`${APP_PRICING.maxScreens}画面を超える場合は、個別にご相談ください。`);
    }
    return { total: lines.reduce((sum, l) => sum + l.amount, 0), lines, days, notes, needsConsult };
}

export function formatYen(amount: number): string {
    return `${amount.toLocaleString("ja-JP")}円`;
}
