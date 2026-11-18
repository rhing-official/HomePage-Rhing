import Link from "next/link";
import { Check, Minus, ChevronDown, ArrowRight, Database, TriangleAlert, Workflow, Scale, CircleHelp, BookOpen, StickyNote, type LucideIcon } from "lucide-react";

/**
 * DaiDaiページの「信頼」のためのセクション群。
 * 一般向け・ギーク向けの両方から使う（`AudienceContent.tsx`）。
 * 言えること・言えないことを、具体的に、誇張なく書く。未実装の機能は実装済みのように書かない。
 */

/** 節の見出し。アイコンは必須。 */
export function SectionHeading({ label, title, icon: Icon, mb = "mb-8", center = false }: { label: string; title: string; icon: LucideIcon; mb?: string; center?: boolean }) {
    return (
        <>
            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">{label}</span>
            <h2 className={`text-2xl font-bold ${mb} tracking-wide text-gray-900 text-balance flex items-center gap-3 ${center ? "justify-center" : ""}`}>
                <Icon className="w-5 h-5 text-tertiary shrink-0" strokeWidth={1.5} />
                {title}
            </h2>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* 取得する情報と、取得しない情報                                              */
/* ------------------------------------------------------------------ */

const notHeld = [
    "電話番号",
    "現在地。GPSでの取得も、IPアドレスからの推定もしません",
    "番地等の詳細な住所",
    "マイナンバー",
    "広告の表示と、個人情報の売却",
];

type Held = { name: string; note: string };

// 一般向けは、専門用語や外部サービスの名前（Firebase・Firestore・Stripe・FCMなど）を出さない書き方にする
const heldGeneral: Held[] = [
    { name: "Rhing Seed", note: "アカウントを見分ける為の名前です。" },
    { name: "Google・Appleの識別番号", note: "ログインに使ったGoogleやAppleが発行する識別番号を、ログインの仕組みが保持します。" },
    {
        name: "Googleアカウントのメールアドレス",
        note: "Googleでログインした場合、ログインの仕組みの側に保存されます。Appleでログインした場合は、メールアドレスも名前も受け取りません。",
    },
    { name: "端末の識別番号", note: "不正な利用を防ぐ為に使います。" },
    { name: "メッセージ・画像", note: "サーバー上に保存されます。通信は暗号化されますが、内容はサーバー側で技術的に読めます。詳細は、下の「現在の制限事項と今後の予定」に書いています。" },
    { name: "居住地", note: "国・都道府県・タイムゾーンを、本人の申告で保存します。本人だけが読める場所に保存し、他の利用者には表示しません。" },
    { name: "ぺったんの閲覧回数", note: "回数だけを記録し、誰が見たかは記録しません。" },
    { name: "通知の宛先", note: "通知を届ける為に使います。" },
    { name: "決済時のメールアドレス・カード名義", note: "極み等の購入時に、決済を代行する事業者が取得します。カード情報もその事業者が管理し、DaiDaiは保持しません。" },
];

const heldGeek: Held[] = [
    { name: "Rhing Seed", note: "アカウントを見分ける為の名前です。" },
    { name: "Google・Appleの識別子", note: "ログインに使った提供元が発行する識別子を、認証基盤（Firebase Authentication）が保持します。" },
    {
        name: "Googleアカウントのメールアドレス",
        note: "Googleでログインした場合、認証基盤に保存されます。Appleでログインした場合は、メールアドレスも名前も受け取りません。",
    },
    { name: "デバイスID", note: "セキュリティの為に使います。" },
    { name: "メッセージ・画像", note: "サーバー上に保存されます。通信は暗号化されますが、内容はサーバー側で技術的に読めます。詳細は、下の「現在の制限事項と今後の予定」に書いています。" },
    { name: "居住地", note: "国・都道府県・タイムゾーンを、本人の申告で保存します。本人だけが読める領域に保存し、他の利用者には表示しません。" },
    { name: "ぺったんの閲覧回数", note: "回数だけを記録し、誰が見たかは記録しません。" },
    { name: "通知の宛先", note: "FCMトークンを、プッシュ通知を届ける為に使います。" },
    { name: "決済時のメールアドレス・カード名義", note: "極み等の購入時に、決済代行のStripeが取得します。カード情報はStripeが管理し、DaiDaiは保持しません。" },
];

export function DataSection({ id = "data", geek = false }: { id?: string; geek?: boolean }) {
    const held = geek ? heldGeek : heldGeneral;
    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="WHAT WE HOLD" title="取得する情報と、取得しない情報" icon={Database} />
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
                メールアドレスを画面に表示せず、DaiDai自身の{geek ? "Firestoreのデータベース" : "保存先"}にも保存しません。但し、下に挙げた情報は扱います。
            </p>
            <div className="flex flex-col gap-6">
                <div className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="text-base font-bold text-gray-900 mb-4">取得しない情報</h3>
                    <ul className="space-y-3">
                        {notHeld.map((t) => (
                            <li key={t} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                <Minus className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="text-base font-bold text-gray-900 mb-4">取得している情報</h3>
                    <ul className="space-y-4">
                        {held.map((h) => (
                            <li key={h.name} className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-tertiary shrink-0 mt-1" strokeWidth={1.5} />
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-bold text-gray-800">{h.name}</span>
                                                                        <br />
                                    {h.note}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mt-4">
                詳しい項目と保存期間は、
                <Link href="/legal/privacy" className="underline hover:text-gray-600">プライバシーポリシー</Link>
                をご覧ください。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 正直に書くこと                                                        */
/* ------------------------------------------------------------------ */

export function HonestSection({ id = "honest", geek = false }: { id?: string; geek?: boolean }) {
    const items: { title: string; body: React.ReactNode }[] = [
        {
            title: "メッセージのE2E暗号化は、まだ実装していません",
            body: (
                <>
                    通信は暗号化されますが、メッセージの内容はサーバー側で技術的に読めます。
                    メッセージのE2E暗号化
                    は、2027年夏頃を目処に実装する予定です。専門家のセキュリティレビューを経て本番に投入する予定ですが、未計画なので変わる可能性も有ります。
                </>
            ),
        },
        {
            title: "運営によるプロフィールの閲覧",
            body: (
                <>
                    運営は、既定では利用者のプロフィールを見ない方針です。見る場合は、理由を、通報への対応、不正利用の調査、その他の中から選び、その操作は監査ログに記録されます。これは閲覧を遮断する仕組みではなく、後から検証する為の仕組みです。また、技術的には、ログイン済みの利用者であれば、プロフィールの実データをアプリから直接読める作りになっています。但し、画面上は、他の利用者に表示しません。
                    {geek && (
                        <>
                            {" "}
                            Firestoreのセキュリティルールで、<code className="text-xs bg-gray-100 rounded px-1">users</code>の読み取りは「ログイン済みなら可」としています。監査ログ（<code className="text-xs bg-gray-100 rounded px-1">adminAuditLogs</code>）はサーバー側（Admin SDK）だけが書き込め、クライアントからは読み書きできません。
                        </>
                    )}
                </>
            ),
        },
        {
            title: geek ? "データは、GoogleのFirebase上に有ります" : "データはGoogle Cloudに有ります",
            body: <>将来、自前のサーバーへ移すことを検討していますが、時期は約束しません。</>,
        },
        {
            title: "GoogleやAppleでログインすると、使っている事実が伝わります",
            body: (
                <>
                    GoogleやAppleでログインすると、DaiDaiを使っているという事実が、その提供元に伝わります。気になる方は、パスキーを使えます。
                </>
            ),
        },
    ];

    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="HONESTY" title="現在の制限事項と今後の予定" icon={TriangleAlert} />
            <div className="flex flex-col gap-4">
                {items.map((it) => (
                    <div key={it.title} className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-base font-bold text-gray-900 mb-3 text-balance">{it.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{it.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* データの扱いの流れ（電気通信事業の届出を含む）                          */
/* ------------------------------------------------------------------ */

const lifecycle: { title: string; body: string }[] = [
    {
        title: "通常のアカウント削除",
        body: "申請から30日間は情報を保持し、その間にログインすると復元出来ます。何もしないまま日本時間の31日目の0時になると、サーバーから全ての情報を完全に削除します。",
    },
    {
        title: "即時のアカウント削除",
        body: "30日の猶予を置かず、その場で完全に削除します。復元はできません。",
    },
    {
        title: "メッセージを削除する",
        body: "自分の削除は、自分の画面から見えなくするだけです。その語らいの参加者全員が削除し終えた時点で、サーバーからも物理的に削除します。",
    },
    {
        title: "画像の保存期間",
        body: "標準画質は、語らいの中では2週間です。アルバムに保存した画像は残ります。極みの高画質は、語らいの中では1週間です。この間、画像はサーバー上に有ります。",
    },
    {
        title: "絶縁",
        body: "一対の相手と双方が同意すると、その一対の履歴を物理的に削除します。提案すると、相手に通知を1件送ります。",
    },
];

export function NotificationCard() {
    return (
        <div id="notification" className="scroll-mt-8 bg-white/50 backdrop-blur-md border border-white/80 shadow-elevation-2 rounded-lg p-8">
            <h3 className="text-base font-bold text-gray-900 mb-4">電気通信事業の届出</h3>
            <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                DaiDaiは、電気通信事業法に基づく電気通信事業の届出を、総務大臣に対して行っています。
            </p>
            <dl className="text-sm border-t border-gray-200">
                <div className="flex gap-4 py-3 border-b border-gray-100">
                    <dt className="w-24 shrink-0 text-gray-500">届出番号</dt>
                    <dd className="text-gray-800 font-bold tracking-wider">E-08-05840</dd>
                </div>
                <div className="flex gap-4 py-3 border-b border-gray-100">
                    <dt className="w-24 shrink-0 text-gray-500">届出年月日</dt>
                    <dd className="text-gray-800">2026年10月5日</dd>
                </div>
                <div className="flex gap-4 py-3 border-b border-gray-100">
                    <dt className="w-24 shrink-0 text-gray-500">届出者</dt>
                    <dd className="text-gray-800">Rhing（畑中 新）</dd>
                </div>
            </dl>
        </div>
    );
}

export function LifecycleSection({ id = "lifecycle" }: { id?: string }) {
    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="DATA LIFECYCLE" title="データの扱いの流れ" icon={Workflow} />
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {lifecycle.map((l) => (
                    <div key={l.title} className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-2">{l.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{l.body}</p>
                    </div>
                ))}
            </div>
            <NotificationCard />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 比較表                                                               */
/* ------------------------------------------------------------------ */

type Cell = { text?: string[]; generalText?: string[]; quotes?: string[]; href?: string; none?: boolean; emphasis?: boolean };

const compareHeads = ["DaiDai", "LINE", "Discord", "Signal"];

const TERMS = "https://discord.com/terms";
const SIGNAL_TOP = "https://signal.org/";

// 他社のセルは、公式ページの原文（英語は英語のまま）をそのまま引用する。確認日: 2026年11月18日
const compareRows: { label: string; cells: Cell[] }[] = [
    {
        label: "登録に必要なもの",
        cells: [
            { text: ["Google／Apple／パスキー。メール・電話番号の入力は不要"] },
            { none: true },
            { quotes: ["a way of contacting you (such as an email address and/or phone number)", "You'll also need to provide your birthday."], href: TERMS },
            { none: true },
        ],
    },
    {
        label: "広告",
        cells: [
            { text: ["なし"] },
            { none: true },
            { quotes: ["sponsored content (like Quests or other sponsored formats)"], href: TERMS },
            { quotes: ["There are no ads, no affiliate marketers, and no creepy tracking in Signal."], href: SIGNAL_TOP },
        ],
    },
    {
        label: "メッセージの暗号化",
        cells: [
            { text: ["E2E暗号化は未実装。通信は暗号化されますが、内容はサーバー側で技術的に読めます。2027年夏頃を目処に実装する予定です。未計画なので、変わる可能性も有ります。"], emphasis: true },
            {
                quotes: [
                    "Both users have Letter Sealing enabled in 1-to-1 chats",
                    "All users have Letter Sealing enabled in group chats (groups with up to 50 members)",
                    "Group calls, group video calls, and Line meeting are only protected with transport-level encryption.",
                ],
                href: "https://www.lycorp.co.jp/en/privacy-security/security/transparency/encryption-report/2025/",
            },
            {
                quotes: [
                    "End-to-end Encryption is now standard for every voice and video call on Discord, outside of stage channels.",
                    "We have no current plans to extend E2EE to text messages.",
                ],
                href: "https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted",
            },
            { quotes: ["We can't read your messages or listen to your calls, and no one else can either."], href: SIGNAL_TOP },
        ],
    },
    {
        label: "料金",
        cells: [
            { text: ["無料。極みは月額¥300"] },
            { none: true },
            {
                quotes: [
                    "We won't charge you a fee to use the basic functionality of our services, but you may be able to pay for additional features and products.",
                    "$2.99 / MONTH",
                    "$9.99 / MONTH",
                ],
                href: TERMS,
            },
            { quotes: ["Free for Everyone", "Signal is an independent nonprofit."], href: SIGNAL_TOP },
        ],
    },
    {
        label: "対応OS",
        cells: [
            { text: ["Webと、APKのみのAndroid。iOS・Windows・macOS・Linuxは対応予定"], emphasis: true },
            { none: true },
            { quotes: ["Available on Windows, macOS, Linux, iOS, Android, and consoles."], href: "https://discord.com/download" },
            { quotes: ["Android", "iPhone & iPad", "Windows", "Mac", "Linux"], href: "https://signal.org/download/" },
        ],
    },
];

export function CompareSection({ id = "compare", geek = false }: { id?: string; geek?: boolean }) {
    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="COMPARISON" title="他のアプリとの比較" icon={Scale} />
            <p className="text-gray-600 text-sm leading-relaxed text-pretty mb-6 max-w-3xl">
                LINE・Discord・Signalと、公式ページに書かれていることを並べます。他社の欄は、公式ページの原文をそのまま引用し、出典のリンクを付けています。DaiDaiが劣る点は、太字で示した枠に、そのまま載せています。
            </p>
            <div className="overflow-x-auto bg-white rounded-m3-lg shadow-sm border border-gray-100">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs tracking-widest">
                            <th className="p-4 w-32"></th>
                            {compareHeads.map((h) => (
                                <th key={h} className="p-4">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {compareRows.map((row) => (
                            <tr key={row.label} className="border-b last:border-0 border-gray-100 align-top">
                                <th className="p-4 font-bold text-gray-800 whitespace-nowrap align-top">{row.label}</th>
                                {row.cells.map((c, i) => (
                                    <td key={i} className="p-4 leading-relaxed">
                                        {c.none && <span className="text-gray-400">—</span>}
                                        {c.text && (
                                            <span className={c.emphasis ? "font-bold text-gray-800" : ""}>{(!geek && c.generalText ? c.generalText : c.text).join("")}</span>
                                        )}
                                        {c.quotes && (
                                            <>
                                                <ul className="space-y-1.5">
                                                    {c.quotes.map((q) => (
                                                        <li key={q} lang="en" className="text-xs text-gray-600">
                                                            &ldquo;{q}&rdquo;
                                                        </li>
                                                    ))}
                                                </ul>
                                                {c.href && (
                                                    <a
                                                        href={c.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-xs text-gray-400 underline hover:text-gray-700"
                                                    >
                                                        出典
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ul className="mt-4 space-y-1.5 text-xs text-gray-400 leading-relaxed">
                <li>確認日: 2026年11月18日。他社の欄は、各社の公式ページの記述で、その後に変更されている場合が有ります。</li>
                <li>「—」は、公式ページ同士の記述が食い違う、または確認できなかった為、記載していない項目です。</li>
                <li>Appleでのログインは、本番環境のWeb版でログイン出来ることを確認しています。</li>
                <li>
                    {geek
                        ? "メールアドレスは、画面に表示せず、DaiDai自身のデータベース（Firestore）にも保存しません。Googleでログインした場合は、認証基盤（Firebase Authentication）にGoogleアカウントのメールアドレスが保存されます。"
                        : "メールアドレスは、画面に表示せず、DaiDai自身の保存先にも保存しません。Googleでログインした場合は、ログインの仕組みの側に、Googleアカウントのメールアドレスが保存されます。"}
                    Appleでログインした場合は、メールアドレスも名前も受け取りません。
                </li>
            </ul>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* ぺったん・クリエイター                                                */
/* ------------------------------------------------------------------ */

export function CreatorsSection({ id = "creators" }: { id?: string }) {
    return (
        <div id={id} className="scroll-mt-8 bg-white rounded-m3-lg shadow-sm border border-gray-100 p-8 md:p-12 max-w-3xl mx-auto w-full">
            <SectionHeading label="FOR CREATORS" title="ぺったんを作って、出品する" icon={StickyNote} mb="mb-6" />
            <p className="text-gray-600 text-sm leading-relaxed text-pretty mb-4">
                作ったぺったんを、daidai横丁に出品出来ます。有料化した際の目標として、購入額の約91.4%の還元を目指しています。これは概算で、保証するものではありません。
            </p>
            <p className="text-gray-600 text-sm leading-relaxed text-pretty mb-6">
                当面は、無料のぺったんのみを扱います。還元は、まだ発生していません。
            </p>
            <Link
                href="/services/daidai-yokocho#fee"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 border-b border-gray-400 hover:border-gray-800 transition-colors pb-0.5"
            >
                算出の前提を見る
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* よくある質問・用語集                                                  */
/* ------------------------------------------------------------------ */

const faqs: { q: string; a: string; generalA?: string }[] = [
    {
        q: "なぜGoogleやAppleのアカウントが要るのですか？",
        a: "DaiDai自身がパスワードを保持しない為に、ログインをGoogleやAppleに任せているからです。GoogleやAppleを使いたくない場合は、メールアドレスが要らないパスキーでも、アカウントを作れます。GoogleやAppleでログインすると、DaiDaiを使っている事実がその提供元に伝わります。",
    },
    {
        q: "機種を変えたら、どうなりますか？",
        a: "以前と同じ方法でログインすれば、アカウントのデータを引き続き使えます。パスキーは、複数の端末分を前もって登録しておけます。パスキーをなくした場合は、予め決めた3つの秘密の質問に答えて、復旧出来ます。",
    },
    {
        q: "アカウントを削除すると、どうなりますか？",
        a: "通常の削除は、30日の猶予のあとに完全に削除します。猶予の間は、復元出来ます。即時削除は、その場で完全に削除し、復元出来ません。詳細は「データの扱いの流れ」をご覧ください。",
    },
    {
        q: "メッセージは、誰が読めますか？",
        a: "その語らいの参加者が読めます。また、現時点ではメッセージのE2E暗号化を実装していない為、内容はサーバー側で技術的に読めます。E2E暗号化は、2027年夏頃を目処に実装する予定ですが、未計画なので、変わる可能性も有ります。",
    },
    {
        q: "対応しているOSは？",
        a: "現在使えるのは、Web版と、Android版です。Android版は、APKのみです。iOS・Windows・macOS・Linuxは対応予定ですが、時期は決めていません。",
    },
    {
        q: "お金はかかりますか？",
        a: "基本の機能は無料です。極みプランは月額¥300で、既読の非表示や限定フォント等が使えます。広告は有りません。",
    },
    {
        q: "通話は、何人まで参加出来ますか？",
        a: "広場の通話は、現在は最大5人です。人数を増やす為の通信基盤の強化を予定しています。",
    },
];

export function FaqSection({ id = "faq", geek = false }: { id?: string; geek?: boolean }) {
    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="FAQ" title="よくある質問" icon={CircleHelp} />
            <div className="flex flex-col gap-3">
                {faqs.map((f) => (
                    <details key={f.q} className="group bg-white rounded-m3-lg shadow-sm border border-gray-100">
                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 text-gray-900 font-bold text-sm leading-relaxed">
                            {f.q}
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" strokeWidth={1.5} />
                        </summary>
                        <p className="px-5 md:px-6 pb-5 md:pb-6 text-gray-600 text-sm leading-relaxed text-pretty">{!geek && f.generalA ? f.generalA : f.a}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}

const glossary: [string, string][] = [
    ["一対（いっつい）", "友達との1対1の語らいです。"],
    ["広場（ひろば）", "3人以上のグループです。現在は、友人だけの非公開の広場「裏広場」を使えます。"],
    ["寄合（よりあい）", "語らいの中に作る、話題毎の話し合いの場です。"],
    ["蔵（くら）", "アイコンや呼び名等の素材を、それぞれ複数個登録しておく場所です。"],
    ["仕立て（したて）", "蔵の素材を組み合わせて、プロフィールカードを作ります。無料では最大3枚、極みプランでは10枚まで作れます。"],
    ["縁結び（えんむすび）", "招待リンクやQRコードで、友達を追加する仕組みです。"],
    ["ぺったん", "DaiDaiで使えるスタンプです。"],
    ["極み（きわみ）", "月額¥300の有料プランです。"],
];

export function GlossarySection({ id = "glossary" }: { id?: string }) {
    return (
        <div id={id} className="scroll-mt-8">
            <SectionHeading label="GLOSSARY" title="用語集" icon={BookOpen} />
            <dl className="bg-white rounded-m3-lg shadow-sm border border-gray-100 divide-y divide-gray-100">
                {glossary.map(([term, desc]) => (
                    <div key={term} className="flex flex-col sm:flex-row gap-1 sm:gap-6 p-5 md:p-6">
                        <dt className="sm:w-44 shrink-0 font-bold text-gray-800 text-sm">{term}</dt>
                        <dd className="text-gray-600 text-sm leading-relaxed">{desc}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
