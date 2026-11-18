"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Ban,
    Users,
    MessageCircle,
    Layers,
    QrCode,
    StickyNote,
    Bell,
    KeyRound,
    Lock,
    Network,
    ArrowRight,
    ChevronDown,
    Mic,
    ScreenShare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";
import CtaCard from "@/components/ui/CtaCard";
import { useAudience, AudienceToggle } from "./AudienceContext";
import {
    DataSection,
    HonestSection,
    LifecycleSection,
    CompareSection,
    CreatorsSection,
    FaqSection,
    GlossarySection,
} from "./TrustSections";

type ContentsItem = { href: string; label: string };

function ContentsNav({ items }: { items: ContentsItem[] }) {
    return (
        <div className="w-full max-w-md text-left">
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
    { href: "#data", label: "何を持ち、何を持たないか" },
    { href: "#honest", label: "正直に書くこと" },
    { href: "#features", label: "主な機能" },
    { href: "#screenshots", label: "アプリの画面" },
    { href: "#more", label: "その他の機能" },
    { href: "#plan", label: "極みプラン" },
    { href: "#creators", label: "ぺったんを出品する" },
    { href: "#lifecycle", label: "データの扱いの流れ・電気通信事業の届出" },
    { href: "#compare", label: "他のアプリとの比較" },
    { href: "#faq", label: "よくある質問" },
    { href: "#glossary", label: "用語集" },
    { href: "#future", label: "未実装の機能について" },
];

const geekContents: ContentsItem[] = [
    { href: "#stack", label: "技術スタック" },
    { href: "#security", label: "プライバシー・セキュリティ" },
    { href: "#data", label: "何を持ち、何を持たないか" },
    { href: "#honest", label: "正直に書くこと" },
    { href: "#lifecycle", label: "データの扱いの流れ・電気通信事業の届出" },
    { href: "#architecture", label: "アーキテクチャ" },
    { href: "#compare", label: "他のアプリとの比較" },
    { href: "#roadmap", label: "実装ロードマップ" },
    { href: "#pending", label: "未実装の機能について" },
    { href: "#creators", label: "ぺったんを出品する" },
    { href: "#faq", label: "よくある質問" },
    { href: "#glossary", label: "用語集" },
    { href: "#github", label: "リポジトリ" },
];

export function AudienceHeader() {
    const { audience } = useAudience();
    const items = audience === "general" ? generalContents : geekContents;

    return (
        <div className="flex flex-col md:flex-row gap-8 md:items-start mb-20">
            <div className="shrink-0">
                <AudienceToggle />
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={audience}
                    className="w-full max-w-md"
                    initial={{ opacity: 0, filter: "blur(12px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(12px)" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                    <ContentsNav items={items} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

const pillars: { icon: typeof ShieldCheck; title: string; desc: React.ReactNode }[] = [
    {
        icon: ShieldCheck,
        title: "電話番号・現在地は集めない",
        desc: (
            <>
                電話番号と現在地は集めません。Googleでログインすると、Gmailアドレスが保存されます。Appleでログインした場合は、メールアドレスも名前も受け取りません。
                <a href="#data" className="underline underline-offset-2 hover:text-gray-900">詳しくは、こちら</a>
            </>
        ),
    },
    {
        icon: Ban,
        title: "広告なし",
        desc: "広告に邪魔されず、大切な人とのやり取りに集中できます。",
    },
    {
        icon: KeyRound,
        title: "かんたん・安全なログイン",
        desc: "Google/Appleアカウント、またはパスキーだけで使えます。認証アプリによる2段階認証にも対応しています。",
    },
];

type FeatureStatus = "近日実装予定" | "将来実装予定" | "検討中";

const featureRoadmapBadge: Record<FeatureStatus, string> = {
    近日実装予定: "text-tertiary bg-tertiary/10",
    将来実装予定: "text-gray-500 bg-gray-100",
    検討中: "text-gray-400 border border-gray-300",
};

const featureRoadmap: { name: string; status: FeatureStatus }[] = [
    { name: "iPhone・Mac・Windows・Linuxでの通知対応", status: "近日実装予定" },
    { name: "カードがなくても買える、極みの期間パス（PayPayなど）", status: "近日実装予定" },
    { name: "災害時の安否確認", status: "近日実装予定" },
  {
    name: "読み込み中の表示をスケルトンスクリーンに", status: "近日実装予定" },
    { name: "使い方ガイドの実装", status: "近日実装予定" },
    { name: "表示言語にマンダリンを追加", status: "近日実装予定" },
    { name: "通知音・着信音の拡充", status: "近日実装予定" },
    { name: "既読表示の細かい設定（極み向け）", status: "近日実装予定" },
    { name: "誰でも参加できる広場など、コミュニティ機能の拡張", status: "将来実装予定" },
    { name: "広場の通話の人数拡大に向けた通信基盤の強化", status: "将来実装予定" },
    { name: "大容量ファイルの直接送信", status: "将来実装予定" },
    { name: "1080p高画質ビデオ通話（極みプラン向け）", status: "将来実装予定" },
    { name: "画面の配置のカスタマイズ・極み限定カラーなど、極みプランの特典の追加", status: "将来実装予定" },
    { name: "通知タイミングの詳細設定", status: "将来実装予定" },
    { name: "ドイツ語・オランダ語・イタリア語・スペイン語・ポルトガル語の表示言語", status: "将来実装予定" },
    { name: "新しいUIスタイル（回路風）", status: "将来実装予定" },
    { name: "画面を切り替えるときの、部品のアニメーション", status: "将来実装予定" },
    { name: "共有ノートの使い心地をObsidianにさらに近づける", status: "将来実装予定" },
    { name: "画像・動画の拡大表示のなめらかさの向上", status: "将来実装予定" },
    { name: "祝日・祭日の画像表示", status: "将来実装予定" },
    { name: "タブレットのマウスなど、「戻る」「進む」操作の対応拡大", status: "将来実装予定" },
    { name: "認証アプリ上でのRhingのアイコン表示", status: "将来実装予定" },
    { name: "不正利用の検知の強化", status: "将来実装予定" },
    { name: "ブラウザの「戻る」操作での画面復元", status: "検討中" },
    { name: "送信前の画像編集（トリミング・回転・モザイク・落書き）", status: "検討中" },
    { name: "Rhing Seedでの友達追加のあり方の見直し", status: "検討中" },
];

const notPlannedFeatures = [
    "広告表示",
    "個人情報の売却",
    "メールアドレス・電話番号での登録",
    "DaiDai独自ポイント",
    "マイナンバー連携",
    "着せ替え機能",
    "メーラー機能",
    "一方的な友達解除（ブロックで対応）",
];

function RoadmapRow({ status, items, muted = false }: { status: FeatureStatus | "実装しない機能"; items: string[]; muted?: boolean }) {
    const badge = status === "実装しない機能" ? "text-gray-400 border border-gray-300" : featureRoadmapBadge[status];
    return (
        <div className={`bg-white shadow-sm border border-gray-100 rounded-m3-lg p-6 md:p-8 flex flex-col md:flex-row gap-4 md:gap-10`}>
            <div className="md:w-40 shrink-0">
                <span className={`inline-block text-xs font-bold tracking-wide rounded-full px-3 py-1 ${badge}`}>{status}</span>
            </div>
            <ul className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                {items.map((f) => (
                    <li key={f} className={"flex items-start gap-3 text-sm leading-relaxed text-gray-600"}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${muted ? "bg-gray-900" : "bg-tertiary"}`} />
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// 一般向けは、外部サービスの名前を出さない言い方にする
const generalNames: Record<string, string> = {
    "カードがなくても買える、極みの期間パス（PayPayなど）": "カードがなくても買える、極みの期間パス（スマホ決済など）",
    "共有ノートの使い心地をObsidianにさらに近づける": "共有ノートの使い心地を、本格的なメモアプリにさらに近づける",
};

function FeatureRoadmapSection({ id }: { id: string }) {
    const [open, setOpen] = useState(false);
    const { audience } = useAudience();
    const label = (n: string) => (audience === "general" ? generalNames[n] ?? n : n);
    const itemsOf = (status: FeatureStatus) => featureRoadmap.filter((f) => f.status === status).map((f) => label(f.name));
    return (
        <div id={id} className="scroll-mt-8">
            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">UNIMPLEMENTED FEATURES</span>
            <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900">未実装の機能について</h2>
            <div className="flex flex-col gap-6">
                <RoadmapRow status="近日実装予定" items={itemsOf("近日実装予定")} />

                {/* 時期の目処がある予定は、近日実装予定とは分けて扱う */}
                <div className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-4 md:gap-10">
                    <div className="md:w-40 shrink-0">
                        <span className="inline-block text-xs font-bold tracking-wide rounded-full px-3 py-1 text-gray-600 bg-gray-100">
                            時期の目処がある予定
                        </span>
                    </div>
                    <div className="flex-1 flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-tertiary rounded-full shrink-0 mt-2" />
                        <p>
                            {audience === "general" ? "メッセージを、送った人と受け取った人だけが読める暗号化" : "メッセージのE2E暗号化"}を、2027年夏頃を目処に実装する予定です。約束ではなく、予定です。専門家のセキュリティレビューを経て本番に投入します。
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={`${id}-more`}
                    className="self-start inline-flex items-center gap-2 text-sm font-bold text-gray-700 border border-gray-300 rounded-full px-5 py-2 hover:bg-white transition-colors"
                >
                    将来実装予定・検討中・実装しない機能を{open ? "閉じる" : "見る"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
                </button>
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            id={`${id}-more`}
                            key="more"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col gap-6">
                                <RoadmapRow status="将来実装予定" items={itemsOf("将来実装予定")} />
                                <RoadmapRow status="検討中" items={itemsOf("検討中")} />
                                <RoadmapRow status="実装しない機能" items={notPlannedFeatures} muted />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const moreFeatures = [
    { icon: Users, title: "役職・呼び名の色分け", desc: "広場ごとに役職を自由に作り、寄合の管理や招待リンクの発行などの権限と、呼び名の色を細かく設定できます。" },
    { icon: Layers, title: "蔵・仕立て", desc: "アイコンや呼び名などの素材を蔵に登録しておき、仕立てで組み合わせて、プロフィールカードを作ります。無料では最大3枚、極みプランでは10枚まで作れます。呼び名や一言も、カードごとに設定できます。" },
    { icon: QrCode, title: "縁結び", desc: "招待リンクやQRコードで、簡単に友達を追加できます。" },
    { icon: StickyNote, title: "共有ノート・カレンダー・投票・アルバム", desc: "グループでのメモ共有、予定調整、多数決、写真の保管もアプリ内で完結します。" },
    { icon: Bell, title: "通知音・着信音のカスタマイズ", desc: "用意された音から選べるほか、自分の音源をアップロードすることもできます。" },
    { icon: KeyRound, title: "かんたん・安全なログイン", desc: "Google/Appleアカウント、パスキー、2段階認証（認証アプリ対応）、QRコードでのログインに対応しています。Appleでのログインは、本番環境のWeb版でログインできることを確認しています。Android・iOS・macOS・Windowsのアプリ版は、確認できた範囲から順にお知らせします。" },
    { icon: Mic, title: "通話のノイズ除去", desc: "通話中の雑音を抑えるノイズ除去を使えます。Web版のみで、アプリ版は未対応です。" },
    { icon: ScreenShare, title: "画面共有", desc: "広場と一対の通話で、画面を共有できます。Web版で使えます。Androidは確認中です。" },
];

function GeneralContent() {
    return (
        <div className="max-w-5xl mx-auto">
            {/* 3支柱ブロック */}
            <div id="pillars" className="grid md:grid-cols-3 gap-8 mb-24 scroll-mt-8">
                {pillars.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100 text-left">
                        <p.icon className="w-8 h-8 mb-4 text-tertiary" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 text-balance">{p.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{p.desc}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-24 mb-24">
                <DataSection />
                <HonestSection />
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
                                3人以上のグループ「広場」
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
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">メッセージに合わせて届くぺったん</h2>
                        <p className="text-gray-600 leading-relaxed text-pretty">
                            メッセージの内容に合わせて使えそうなぺったんを自動で提案してくれます。
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
                            一対でも広場でも、音声・ビデオ通話が使えます。
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
                        <p className="text-gray-600 leading-relaxed text-pretty">
                            「フラット」「ガラス」「劇画」「版画」の4スタイルに加え、外観は胡粉・墨・鈍色・漆黒の4つから選べます。アクセントカラーはカラーコードで自由に指定でき、フォントも25種類から選べます。
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Web) - UIスタイル切り替え（フラット/劇画/ガラスの見た目比較）]" aspect="video" />
                    </div>
                </div>
            </div>

            {/* スクリーンショットギャラリー */}
            <div id="screenshots" className="bg-white/50 rounded-m3-xl p-8 md:p-12 mb-24 scroll-mt-8">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">SCREENSHOTS</span>
                    <h2 className="text-2xl font-bold tracking-wide text-gray-900 text-balance">アプリの画面</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 一対・広場タブ、下部ナビゲーション]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - チャット画面]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 蔵・仕立て（プロフィール管理画面）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル - 縁結び（招待QRコード画面）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: ログイン画面（パスキー・Google/Appleログインの選択肢）]" aspect="portrait" />
                </div>
            </div>

            {/* その他の機能タイル */}
            <div id="more" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 scroll-mt-8">
                {moreFeatures.map((f, i) => (
                    <div key={i} className="bg-white p-6 rounded-m3-lg shadow-sm border border-gray-100">
                        <f.icon className="w-6 h-6 mb-3 text-tertiary" strokeWidth={1.5} />
                        <h3 className="text-base font-bold mb-2 text-gray-900 text-balance">{f.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed text-pretty">{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* 極みプラン */}
            <div id="plan" className="bg-white rounded-m3-lg shadow-sm border border-gray-100 p-8 md:p-12 text-center max-w-2xl mx-auto mb-24 scroll-mt-8">
                <span className="inline-block text-xs font-bold tracking-widest text-tertiary bg-tertiary/10 rounded-full px-4 py-1 mb-4">
                    ご利用いただけます
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">極み プラン</h3>
                <p className="text-gray-500 text-sm mb-6">￥300 / 月</p>
                <ul className="space-y-2 text-left w-fit max-w-full mx-auto mb-6">
                    {["既読の非表示", "限定フォント10種", "プロフィールカードを3枚から10枚に、SNSのURLの登録上限も拡大", "複数アカウントの切り替え"].map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-gray-700 text-sm">
                            <span className="w-1.5 h-1.5 bg-tertiary rounded-full shrink-0" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <a
                    href="https://daidai.rhing.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-tertiary text-white px-8 py-3 rounded-full font-bold tracking-wider hover:bg-tertiary/90 hover:shadow-elevation-2 transition-all mb-4"
                >
                    アプリで購入する
                    <ArrowRight className="w-5 h-5" />
                </a>
                <p className="text-xs text-gray-400 tracking-wide leading-relaxed">
                    ログインして、アプリの「設定」の「アカウント」から、購入と契約の管理ができます。特典は、今後も追加していく予定です。
                </p>
            </div>

            <div className="mb-24">
                <CreatorsSection />
            </div>

            <div className="flex flex-col gap-24 mb-24">
                <LifecycleSection />
                <CompareSection />
                <FaqSection />
                <GlossarySection />
            </div>

            <FeatureRoadmapSection id="future" />
        </div>
    );
}

const techStack: [string, string][] = [
    ["フロントエンド", "Flutter（全てのプラットフォームを1つのコードベースで展開）"],
    ["状態管理", "Riverpod"],
    ["バックエンド", "Firebase（Firestore / Storage / Functions / FCM / Auth）"],
    ["通話", "WebRTC（flutter_webrtc）、シグナリングはFirestore経由、STUN／TURN。広場の通話は、メッシュ型P2Pで現在は最大5人"],
    ["画像処理", "flutter_image_compress（WebP圧縮）"],
    ["認証", "Google Sign-In / Sign in with Apple（メール・名前を要求しない設定。本番環境のWeb版でログインを確認済み）/ WebAuthn（パスキー、Cloud Functions側で@simplewebauthn/serverによる自前Relying Party実装）"],
    ["ルーティング", "go_router"],
    ["決済", "Stripe + Webhook（ブラウザ決済のみ、アプリ内課金は不使用）。極み: 稼働中、ぺったん: 無料配布中（有料化は準備中）"],
];

const roadmap: [string, string, string][] = [
    ["フェーズ1（MVP）", "Google/Apple認証、一対・広場、720pビデオ通話、基本スパム対策", "実装済み"],
    ["フェーズ2（拡充）", "極みプラン（課金化）、ぺったん、E2E暗号化、QRコードログイン", "ぺったん・QRログイン・2段階認証・パスキー・極みプランは前倒しで実装済み。E2E暗号化は未着手（2027年夏頃を目処に実装する予定。約束ではない）"],
    ["フェーズ3（高度化）", "表広場、安否確認、方言対応", "一対の複数会話・広場のカスタムロール機能は前倒しで実装済み。表広場・安否確認は未着手"],
    ["フェーズ4（将来）", "AI搭載メッセージ整理、ぺったん作成アプリ", "未着手"],
];

function GeekContent() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col gap-20">
                {/* 技術スタック */}
                <div id="stack" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">TECH STACK</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900">技術スタック</h2>
                    <div className="overflow-x-auto bg-white rounded-m3-lg shadow-sm border border-gray-100">
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
                        <Lock className="w-5 h-5 text-tertiary" strokeWidth={1.5} />
                        プライバシー・セキュリティ設計
                    </h2>
                    <ul className="space-y-4 text-gray-600 leading-relaxed text-sm">
                        <li>
                            メールアドレスは、画面に表示せず、DaiDai自身のデータベース（Firestore）にも保存しません。Googleでログインした場合は、認証基盤（Firebase Authentication）にGoogleアカウントのメールアドレスが保存されます。Appleでログインした場合は、メールアドレスも名前も受け取りません（スコープを要求しない設定）。電話番号と現在地は集めません。アカウントはGoogle/Apple認証への委任、またはパスキー（WebAuthn、DaiDai自身がRelying Partyとして運用）で成立させており、DaiDai自身はパスワード等の認証情報を保持しません。
                        </li>
                        <li>
                            2段階認証は、Firebase AuthenticationのMulti-Factor Authentication機能を利用し、認証アプリによるワンタイムパスコードのみ対応しています。
                        </li>
                        <li>
                            「Don&apos;t roll your own crypto」を鉄則とし、暗号を自前実装しないことを原則としています。メッセージのE2E暗号化は、鍵管理・オフライン受信・端末紛失時の鍵失効まで含めて実績のあるSignal Protocolと同じ方式を採用する方針で、2027年夏頃を目処に実装する予定です（約束ではありません）。専門家のセキュリティレビューを経て本番に投入します。ただし費用面から、正式な第三者セキュリティ監査は現時点では実施する予定がありません。
                        </li>
                        <li>
                            メッセージの削除は、参加者全員が削除操作を終えた時点で初めてサーバーからも物理削除される設計です。それまでは自分の画面から見えなくなるだけです。
                        </li>
                    </ul>
                </div>

                <DataSection geek />
                <HonestSection geek />
                <LifecycleSection />

                {/* アーキテクチャ */}
                <div id="architecture" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ARCHITECTURE</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900 flex items-center gap-3">
                        <Network className="w-5 h-5 text-tertiary" strokeWidth={1.5} />
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

                <CompareSection geek />

                {/* 実装ロードマップ */}
                <div id="roadmap" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ROADMAP</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900">実装ロードマップ</h2>
                    <div className="overflow-x-auto bg-white rounded-m3-lg shadow-sm border border-gray-100 mb-6">
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

                <CreatorsSection />
                <FaqSection geek />
                <GlossarySection />

                {/* リポジトリ */}
                <div id="github" className="scroll-mt-8">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">REPOSITORY</span>
                    <h2 className="text-2xl font-bold mb-8 tracking-wide text-gray-900">リポジトリ</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { href: "https://github.com/rhing-official/DaiDai", label: "GITHUB", title: "開発の様子を見る", caption: "DaiDaiのリポジトリ" },
                            { href: "https://gitdiagram.com/rhing-official/daidai", label: "DIAGRAM", title: "構成を図解する", caption: "GitDiagramでコードの構成を見る" },
                        ].map((card) => (
                            <CtaCard key={card.href} href={card.href} label={card.label} title={card.title} caption={card.caption} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AudienceContent() {
    const { audience } = useAudience();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={audience}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                {audience === "general" ? <GeneralContent /> : <GeekContent />}
            </motion.div>
        </AnimatePresence>
    );
}
