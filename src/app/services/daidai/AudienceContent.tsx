"use client";

import {
    ShieldCheck,
    Ban,
    Users,
    MessageCircle,
    Palette,
    Layers,
    QrCode,
    StickyNote,
    Bell,
    KeyRound,
    Lock,
    Network,
    ArrowRight,
} from "lucide-react";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";
import { useAudience } from "./AudienceContext";

type ContentsItem = { href: string; label: string };

function ContentsNav({ items }: { items: ContentsItem[] }) {
    return (
        <div className="max-w-sm mx-auto text-left mb-20">
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">CONTENTS</p>
            <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
                {items.map((c, i) => (
                    <a
                        key={c.href}
                        href={c.href}
                        className="group flex items-center justify-between py-4 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <span className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 tracking-widest">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {c.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-transform" strokeWidth={1.5} />
                    </a>
                ))}
            </div>
        </div>
    );
}

const generalContents: ContentsItem[] = [
    { href: "#pillars", label: "選ばれる理由" },
    { href: "#features", label: "主な機能" },
    { href: "#screenshots", label: "アプリの画面" },
    { href: "#more", label: "その他の機能" },
    { href: "#plan", label: "極みプラン" },
    { href: "#future", label: "未実装の機能について" },
];

const geekContents: ContentsItem[] = [
    { href: "#stack", label: "技術スタック" },
    { href: "#security", label: "プライバシー・セキュリティ" },
    { href: "#architecture", label: "アーキテクチャ" },
    { href: "#roadmap", label: "実装ロードマップ" },
    { href: "#pending", label: "未実装の機能について" },
    { href: "#github", label: "リポジトリ" },
];

const pillars = [
    {
        icon: ShieldCheck,
        title: "個人情報を収集しない",
        desc: "メールアドレス・電話番号・位置情報を一切収集しない設計。Google/Appleアカウントやパスキーだけで使えます。",
    },
    {
        icon: Ban,
        title: "広告なし",
        desc: "広告に邪魔されず、大切な人とのやり取りに集中できます。",
    },
    {
        icon: KeyRound,
        title: "かんたん・安全なログイン",
        desc: "Google/Appleアカウント、またはパスキーだけで使えます。面倒な新規登録は不要です。",
    },
];

type FeatureStatus = "近日実装予定" | "将来実装予定" | "検討中";

const featureRoadmapBadge: Record<FeatureStatus, string> = {
    近日実装予定: "text-[#EE7800] bg-[#EE7800]/10",
    将来実装予定: "text-gray-500 bg-gray-100",
    検討中: "text-gray-400 border border-gray-300",
};

const featureRoadmap: { name: string; status: FeatureStatus }[] = [
    { name: "Appleアカウントでのログイン", status: "近日実装予定" },
    { name: "友達解除（アンフレンド）", status: "近日実装予定" },
    { name: "パソコン・スマートフォン以外の端末への通知対応", status: "近日実装予定" },
    { name: "工房で作ったプロフィールカードの活用場面の拡充", status: "近日実装予定" },
    { name: "大容量ファイルの直接送信", status: "近日実装予定" },
    { name: "表示言語切り替えの全画面対応", status: "近日実装予定" },
    { name: "パスキーログインの正式対応", status: "近日実装予定" },
    { name: "極みプラン（有料プラン）の提供開始", status: "近日実装予定" },
    { name: "誰でも参加できる広場など、コミュニティ機能の拡張", status: "将来実装予定" },
    { name: "災害時の安否確認", status: "将来実装予定" },
    { name: "より高性能なノイズキャンセリング", status: "将来実装予定" },
    { name: "通話品質向上のための通信基盤の強化", status: "将来実装予定" },
    { name: "既読表示の細かい設定", status: "将来実装予定" },
    { name: "1080p高画質ビデオ通話（極みプラン向け）", status: "将来実装予定" },
    { name: "より進んだメッセージの暗号化", status: "将来実装予定" },
    { name: "ブラウザの「戻る」操作での画面復元", status: "検討中" },
    { name: "アイコンのアニメーション対応", status: "検討中" },
    { name: "画面共有機能", status: "検討中" },
    { name: "通知タイミングの詳細設定", status: "検討中" },
];

const notPlannedFeatures = [
    "広告表示",
    "個人情報の収集・売却",
    "メールアドレス・電話番号での登録",
    "DaiDai独自ポイント",
    "マイナンバー連携",
    "着せ替え機能",
    "メーラー機能",
    "フォーラム機能",
];

function FeatureRoadmapSection({ id }: { id: string }) {
    return (
        <div id={id} className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900">未実装の機能について</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(["近日実装予定", "将来実装予定", "検討中"] as const).map((status) => (
                    <div key={status} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <span className={`inline-block text-xs font-bold tracking-wide rounded-full px-3 py-1 mb-4 ${featureRoadmapBadge[status]}`}>
                            {status}
                        </span>
                        <ul className="space-y-3">
                            {featureRoadmap
                                .filter((f) => f.status === status)
                                .map((f) => (
                                    <li key={f.name} className="text-sm text-gray-600 leading-relaxed">
                                        {f.name}
                                    </li>
                                ))}
                        </ul>
                    </div>
                ))}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                    <span className="inline-block text-xs font-bold tracking-wide rounded-full px-3 py-1 mb-4 text-gray-400 border border-gray-300">
                        実装しない機能
                    </span>
                    <ul className="space-y-3">
                        {notPlannedFeatures.map((f) => (
                            <li key={f} className="text-sm text-gray-400 leading-relaxed">
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const moreFeatures = [
    { icon: Users, title: "役職・呼び名の色分け", desc: "広場ごとに役職を自由に作り、寄合の管理や招待リンクの発行などの権限と、呼び名の色を細かく設定できます。" },
    { icon: Layers, title: "蔵・工房", desc: "複数のプロフィールを作って使い分けられます。呼び名や一言もプロフィールごとに設定可能。" },
    { icon: QrCode, title: "縁結び", desc: "招待リンクやQRコードで、簡単に友達を追加できます。" },
    { icon: StickyNote, title: "共有ノート・カレンダー・投票・アルバム", desc: "グループでのメモ共有、予定調整、多数決、写真の保管もアプリ内で完結します。" },
    { icon: Bell, title: "通知音・着信音のカスタマイズ", desc: "用意された音から選べるほか、自分の音源をアップロードすることもできます。" },
    { icon: KeyRound, title: "かんたん・安全なログイン", desc: "Google/Appleアカウント、パスキー、2段階認証（認証アプリ対応）、QRコードでのログインに対応しています。" },
];

function GeneralContent() {
    return (
        <div className="max-w-5xl mx-auto">
            <ContentsNav items={generalContents} />

            {/* 3支柱ブロック */}
            <div id="pillars" className="grid md:grid-cols-3 gap-8 mb-24 scroll-mt-8">
                {pillars.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <p.icon className="w-8 h-8 mx-auto mb-4 text-[#EE7800]" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 text-balance">{p.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{p.desc}</p>
                    </div>
                ))}
            </div>

            <div id="features" className="flex flex-col gap-24 mb-24 scroll-mt-8">
                {/* 一対・広場 */}
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="w-full lg:w-1/2">
                        <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">TALK</span>
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">一対（いっつい）・広場（ひろば）</h2>
                        <p className="text-gray-600 leading-relaxed text-pretty mb-6">
                            友達との1対1のやりとりは「一対」。一対の中に寄合を複数作って、話題ごとに分けることもできます。
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3 text-gray-700 text-sm">
                                <MessageCircle className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                一対の中に複数の寄合を作成可能
                            </li>
                            <li className="flex items-center gap-3 text-gray-700 text-sm">
                                <Users className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                3人以上のグループ「広場」。まずは友人限定の非公開の広場である「裏広場」が利用可能
                            </li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Web) - ホーム画面（一対・広場一覧の左右分割表示）]" aspect="video" />
                    </div>
                </div>

                {/* ぺったん自動提案（配置反転） */}
                <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                    <div className="w-full lg:w-1/2">
                        <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">STICKERS</span>
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">メッセージに合わせて届く「ぺったん」</h2>
                        <p className="text-gray-600 leading-relaxed text-pretty">
                            メッセージの内容に合わせて使えそうなぺったんを自動で提案してくれます。ぺったんを作ったクリエイターへの還元率は91.4%と高水準です。
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Web) - チャット画面（メッセージ内容に応じたぺったん自動提案）]" aspect="video" />
                    </div>
                </div>

                {/* 音声・ビデオ通話 */}
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="w-full lg:w-1/2">
                        <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">CALL</span>
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">音声・ビデオ通話</h2>
                        <p className="text-gray-600 leading-relaxed text-pretty">
                            1対1でもグループでも、音声・ビデオ通話が使えます。
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Web) - ビデオ通話画面]" aspect="video" />
                    </div>
                </div>

                {/* 見た目切り替え（配置反転） */}
                <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                    <div className="w-full lg:w-1/2">
                        <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">APPEARANCE</span>
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">好みの見た目に切り替え</h2>
                        <p className="text-gray-600 leading-relaxed text-pretty flex items-center gap-3">
                            <Palette className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                            「フラット」「ガラス」「劇画」の3スタイルに加え、ライト/ダーク表示も選べます。カラーコードで自分好みのデザインに調整も可能です。
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Web) - UIスタイル切り替え（フラット/劇画/ガラスの見た目比較）]" aspect="video" />
                    </div>
                </div>
            </div>

            {/* スクリーンショットギャラリー */}
            <div id="screenshots" className="bg-white/50 rounded-3xl p-8 md:p-12 mb-24 scroll-mt-8">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">SCREENSHOTS</span>
                    <h2 className="text-2xl font-bold tracking-wide text-gray-900 text-balance">アプリの画面</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 一対・広場タブ、下部ナビゲーション]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - チャット画面]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 蔵・工房（プロフィール管理画面）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 縁結び（招待QRコード画面）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: ログイン画面（パスキー・Google/Appleログインの選択肢）]" aspect="portrait" />
                </div>
            </div>

            {/* その他の機能タイル */}
            <div id="more" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 scroll-mt-8">
                {moreFeatures.map((f, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <f.icon className="w-6 h-6 mb-3 text-[#EE7800]" strokeWidth={1.5} />
                        <h3 className="text-base font-bold mb-2 text-gray-900 text-balance">{f.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* 極みプラン */}
            <div id="plan" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center max-w-2xl mx-auto mb-24 scroll-mt-8">
                <span className="inline-block text-xs font-bold tracking-widest text-[#EE7800] bg-[#EE7800]/10 rounded-full px-4 py-1 mb-4">
                    現在機能制限なしで無料開放中
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">極み プラン</h3>
                <p className="text-gray-400 text-sm mb-6">￥300 / 月（将来価格）</p>
                <ul className="space-y-2 text-left max-w-xs mx-auto mb-6">
                    <li className="flex items-center gap-3 text-gray-700 text-sm">
                        <span className="w-1.5 h-1.5 bg-[#EE7800] rounded-full shrink-0" />
                        既読の非表示
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm">
                        <span className="w-1.5 h-1.5 bg-[#EE7800] rounded-full shrink-0" />
                        1080pの高画質ビデオ通話
                    </li>
                </ul>
                <p className="text-xs text-gray-400 tracking-wide">
                    上記の機能も含め、現在はすべて無料でご利用いただけます。今後、課金が始まる可能性があります。
                </p>
            </div>

            <FeatureRoadmapSection id="future" />
        </div>
    );
}

const techStack: [string, string][] = [
    ["フロントエンド", "Flutter（全てのプラットフォームを1つのコードベースで展開）"],
    ["状態管理", "Riverpod"],
    ["バックエンド", "Firebase（Firestore / Storage / Functions / FCM / Auth）"],
    ["通話", "WebRTC（flutter_webrtc）、シグナリングはFirestore経由、STUNのみ"],
    ["画像処理", "flutter_image_compress（WebP圧縮）"],
    ["認証", "Google Sign-In / Sign in with Apple / WebAuthn（パスキー、Cloud Functions側で@simplewebauthn/serverによる自前Relying Party実装）"],
    ["ルーティング", "go_router"],
    ["決済（予定）", "Stripe + Webhook（ブラウザ決済のみ、アプリ内課金は不使用）"],
];

const roadmap: [string, string, string][] = [
    ["フェーズ1（MVP）", "Google/Apple認証、一対・広場、720pビデオ通話、基本スパム対策", "実装済み"],
    ["フェーズ2（拡充）", "極みプラン（課金化）、ぺったん、E2E暗号化、QRコードログイン", "ぺったん・QRログイン・2段階認証・パスキーは前倒しで実装済み。極みプラン本体（課金ゲート）・E2E暗号化は未着手"],
    ["フェーズ3（高度化）", "表広場、安否確認、方言対応", "一対の複数会話・広場のカスタムロール機能は前倒しで実装済み。表広場・安否確認は未着手"],
    ["フェーズ4（将来）", "AI搭載メッセージ整理、ぺったん作成アプリ", "未着手"],
];

function GeekContent() {
    return (
        <div className="max-w-5xl mx-auto">
            <ContentsNav items={geekContents} />

            <div className="flex flex-col gap-20">
                {/* 技術スタック */}
                <div id="stack" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">TECH STACK</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900">技術スタック</h2>
                    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                        <table className="w-full text-left">
                            <tbody className="text-gray-600">
                                {techStack.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 border-gray-100">
                                        <td className="p-5 font-bold text-gray-800 whitespace-nowrap align-top w-40">{row[0]}</td>
                                        <td className="p-5 text-sm leading-relaxed">{row[1]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* プライバシー・セキュリティ設計 */}
                <div id="security" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">PRIVACY & SECURITY</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-[#EE7800]" strokeWidth={1.5} />
                        プライバシー・セキュリティ設計
                    </h2>
                    <ul className="space-y-4 text-gray-600 leading-relaxed text-sm">
                        <li>
                            メールアドレス・電話番号・位置情報を一切収集しない設計です。アカウントはGoogle/Apple認証への委任、またはパスキー（WebAuthn、DaiDai自身がRelying Partyとして運用）のみで成立させており、DaiDai自身はパスワード等の認証情報を保持しません。
                        </li>
                        <li>
                            2段階認証は、Firebase AuthenticationのMulti-Factor Authentication機能を利用し、認証アプリによるワンタイムパスコードのみ対応しています。
                        </li>
                        <li>
                            「Don&apos;t roll your own crypto」を鉄則とし、暗号を自前実装しないことを原則としています。将来のE2E暗号化は、鍵管理・オフライン受信・端末紛失時の鍵失効まで含めて実績のあるSignal Protocolと同じ方式を採用する方針です。ただし費用面から、正式な第三者セキュリティ監査は現時点では実施する予定はありません。
                        </li>
                        <li>
                            メッセージの削除は、参加者全員が削除操作を終えた時点で初めてサーバーからも物理削除される設計です。それまでは自分の画面から見えなくなるだけです。
                        </li>
                    </ul>
                </div>

                {/* アーキテクチャ */}
                <div id="architecture" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ARCHITECTURE</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900 flex items-center gap-3">
                        <Network className="w-5 h-5 text-[#EE7800]" strokeWidth={1.5} />
                        アーキテクチャ
                    </h2>
                    <ul className="space-y-4 text-gray-600 leading-relaxed text-sm">
                        <li>
                            バックエンドをFirebaseから段階的に移行していく計画のため、全レイヤーをRepositoryパターンで抽象化しており、UI・ビジネスロジックからFirestore等のSDKを直接叩きません。
                        </li>
                        <li>
                            広場の役職・権限は、Firestoreセキュリティルールが動的な権限計算をできない制約に対応するため、実効権限を非正規化キャッシュとして持たせる方式で実装しています。
                        </li>
                        <li>
                            寄合は「単一モード」「複数モード」を後から自由に切り替えられる設計で、シンプルに使いたい人・会話を細かく分けたい人の両方に対応します。
                        </li>
                    </ul>
                </div>

                {/* 実装ロードマップ */}
                <div id="roadmap" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ROADMAP</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900">実装ロードマップ</h2>
                    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                                    <th className="p-5">フェーズ</th>
                                    <th className="p-5">主な内容</th>
                                    <th className="p-5">状況</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                                {roadmap.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 border-gray-100 align-top">
                                        <td className="p-5 font-bold text-gray-800 whitespace-nowrap">{row[0]}</td>
                                        <td className="p-5 leading-relaxed">{row[1]}</td>
                                        <td className="p-5 leading-relaxed">{row[2]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        現時点で前倒し実装済みの主な機能: パスキー（WebAuthn）ログイン、2段階認証（TOTP）、QRコードログイン、複数会話部屋（寄合）機能、広場のカスタムロール（権限・複数付与対応）、共有ノート、共有カレンダー、投票、通知音・着信音のカスタマイズ、3種類のUIスタイル（フラット・劇画・ガラス）、ダークモード。
                    </p>
                </div>

                <FeatureRoadmapSection id="pending" />
            </div>

            {/* GitHub */}
            <a
                id="github"
                href="https://github.com/rhing-official/DaiDai"
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-64 w-full max-w-sm mx-auto mt-20 scroll-mt-8 bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-orange-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
            >
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-[#EE7800] transition-colors">
                            GITHUB
                        </h3>
                        <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                            開発の様子を見る
                        </p>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                            DaiDaiのリポジトリ
                        </span>
                        <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-[#EE7800] group-hover:bg-[#EE7800] group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
}

export default function AudienceContent() {
    const { audience } = useAudience();
    return audience === "general" ? <GeneralContent /> : <GeekContent />;
}
