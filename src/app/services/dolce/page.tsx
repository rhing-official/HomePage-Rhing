import { Metadata } from "next";
import {
    ShieldCheck,
    MonitorSmartphone,
    Hand,
    LayoutGrid,
    PanelBottom,
    ArrowLeftCircle,
    Menu,
    Keyboard,
    SlidersHorizontal,
    Star,
    FolderOpen,
    FileText,
    Archive,
    ArrowRight,
} from "lucide-react";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";

export const metadata: Metadata = {
    title: "dolce | Rhing",
    description: "本と、甘美な贅沢を。PDF・CBZ対応、ローカル完結のクロスプラットフォーム電子書籍/コミックリーダー",
};

const contents = [
    { href: "#features", label: "機能を見る" },
    { href: "#platforms", label: "対応プラットフォーム" },
];

const pillars = [
    {
        icon: ShieldCheck,
        title: "ローカル完結",
        desc: "書籍データも設定もすべて端末内に保存。クラウドへのアップロードは一切発生しません。",
    },
    {
        icon: MonitorSmartphone,
        title: "クロスプラットフォーム",
        desc: "Android・Windows・Linuxで利用可能。iOS・macOSにも対応予定です。",
    },
    {
        icon: Hand,
        title: "迷わない操作性",
        desc: "タップとキーボード、どちらでも快適に読み進められるシンプルな読書体験。",
    },
];

const mobileFeatures = [
    {
        icon: PanelBottom,
        title: "下部ナビゲーションピル",
        desc: "画面下部のピルに主要操作を集約し、片手でも迷わず操作できます。",
    },
    {
        icon: LayoutGrid,
        title: "タブ一覧グリッド",
        desc: "開いているタブをブラウザアプリ風の2列グリッドでプレビュー。タップで切り替え、×で個別に閉じられます。",
    },
    {
        icon: ArrowLeftCircle,
        title: "右スワイプで戻る",
        desc: "右スワイプで1つ前の階層に戻れます。",
    },
    {
        icon: Hand,
        title: "どこでもスワイプでタブ切替",
        desc: "ナビゲーションピルやタブ一覧シート内は、どこをスワイプしてもタブを切り替えられます。",
    },
    {
        icon: Menu,
        title: "長押しスライドのハンバーガーメニュー",
        desc: "隠れたアイコンをまとめるハンバーガーメニューは、押したまま指を動かして離すだけで選択可能。ネイティブアプリのような操作感です。",
    },
];

type Platform = { name: string; status: "available" | "planned"; url?: string };

const platforms: Platform[] = [
    { name: "Android", status: "available" },
    { name: "Windows", status: "available" },
    { name: "Linux", status: "available" },
    { name: "iOS", status: "planned" },
    { name: "macOS", status: "planned" },
];

export default function DolcePage() {
    return (
        <div className="w-full bg-[#fdfbf7] text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">dolce</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8">「本と、甘美な贅沢を。」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto mb-16">
                    PDF・CBZ対応、ローカル完結のクロスプラットフォーム電子書籍リーダー
                </p>

                {/* 目次 */}
                <div className="max-w-sm mx-auto text-left">
                    <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">CONTENTS</p>
                    <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
                        {contents.map((c) => (
                            <a
                                key={c.href}
                                href={c.href}
                                className="group flex items-center justify-between py-4 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <span className="flex items-center gap-4">
                                    <span className="text-xs text-gray-400 tracking-widest">
                                        {String(contents.indexOf(c) + 1).padStart(2, "0")}
                                    </span>
                                    {c.label}
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-transform" strokeWidth={1.5} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3支柱ブロック */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pillars.map((p, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p.icon className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                            <h3 className="text-lg font-bold mb-3 text-balance">{p.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 主要機能 */}
            <section id="features" className="container mx-auto px-6 py-20">
                <div className="max-w-5xl mx-auto flex flex-col gap-24">
                    {/* マルチタブ・本棚管理 */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">BOOKSHELF</span>
                            <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">マルチタブで広がる本棚</h2>
                            <p className="text-gray-600 leading-relaxed text-pretty">
                                複数の本棚タブを開いて、並行して読書・整理ができます。常駐サイドバーからは本棚の切り替えや検索もすぐに行えます。
                            </p>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Linux) - 本棚グリッド表示]" aspect="video" />
                        </div>
                    </div>

                    {/* お気に入り・フォルダ管理（配置反転） */}
                    <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ORGANIZE</span>
                            <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">お気に入り・フォルダ管理</h2>
                            <p className="text-gray-600 leading-relaxed text-pretty mb-6">
                                本や本棚をお気に入り登録したり、フォルダ単位で整理・削除したりできます。サイドバーからいつでもアクセス可能です。
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Star className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    本・本棚のお気に入り登録
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <FolderOpen className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    フォルダ単位での整理・削除
                                </li>
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Windows) - 本棚サイドバー展開状態]" aspect="video" />
                        </div>
                    </div>

                    {/* ビューア */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">VIEWER</span>
                            <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">迷わないビューア</h2>
                            <p className="text-gray-600 leading-relaxed text-pretty mb-6">
                                画面を3分割したタップ操作で、直感的にページを進められます。キーボードやページスライダーにも対応。
                            </p>

                            {/* タップ操作の図解 */}
                            <div className="grid grid-cols-3 border border-gray-300 rounded-xl overflow-hidden mb-6 text-center text-xs text-gray-500">
                                <div className="p-4 border-r border-gray-300">
                                    <p className="font-bold text-gray-800 mb-1">左</p>
                                    前ページ
                                </div>
                                <div className="p-4 border-r border-gray-300">
                                    <p className="font-bold text-gray-800 mb-1">中央</p>
                                    UI表示切替
                                </div>
                                <div className="p-4">
                                    <p className="font-bold text-gray-800 mb-1">右</p>
                                    次ページ
                                </div>
                            </div>

                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Keyboard className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    キーボードショートカット（ページ送り・タブ操作・ページ検索）
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <SlidersHorizontal className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    ページスライダーで直接ジャンプ
                                </li>
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Linux) - ビューア画面（UIオーバーレイ表示状態）]" aspect="video" />
                        </div>
                    </div>
                </div>
            </section>

            {/* モバイル専用UI（Android） */}
            <section className="container mx-auto px-6 py-20 bg-white/50 rounded-3xl max-w-6xl">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ANDROID</span>
                    <h2 className="text-2xl font-bold tracking-wide text-gray-900 text-balance">モバイル専用のUI</h2>
                    <p className="text-gray-600 leading-relaxed text-pretty mt-4 max-w-xl mx-auto">
                        Androidではネイティブアプリのような操作感を追求した、モバイル専用のUIを用意しています。
                    </p>
                </div>

                {/* スクリーンショットギャラリー */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル(Android) - 本棚一覧・下部ナビゲーションピル]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル(Android) - タブ一覧グリッド（複数タブ表示状態）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル(Android) - ビューア画面（タップでUI表示中）]" aspect="portrait" />
                    <ScreenshotPlaceholder label="[SCREENSHOT: モバイル(Android) - ハンバーガーメニュー展開状態]" aspect="portrait" />
                </div>

                {/* 機能タイルグリッド */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {mobileFeatures.map((f, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <f.icon className="w-6 h-6 mb-3 text-gray-700" strokeWidth={1.5} />
                            <h3 className="text-base font-bold mb-2 text-gray-900 text-balance">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed text-pretty">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 対応フォーマット */}
            <section className="container mx-auto px-6 py-20 text-center">
                <h2 className="text-2xl font-bold mb-12 tracking-widest text-gray-900">対応フォーマット</h2>
                <div className="flex flex-col md:flex-row justify-center gap-8 mb-8 max-w-2xl mx-auto">
                    <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <FileText className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                        <h4 className="text-xl font-bold mb-2">PDF (.pdf)</h4>
                        <p className="text-gray-500 text-sm">電子書籍・文書</p>
                    </div>
                    <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <Archive className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                        <h4 className="text-xl font-bold mb-2">CBZ (.cbz / .zip)</h4>
                        <p className="text-gray-500 text-sm">コミック・画像集</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 tracking-widest italic">※ローカルのファイルを読み込むだけ。アカウント登録もクラウド同期も不要。</p>
            </section>

            {/* 対応プラットフォーム */}
            <section id="platforms" className="container mx-auto px-6 py-20 max-w-4xl">
                <h2 className="text-2xl font-bold mb-12 tracking-widest text-center text-gray-900">対応プラットフォーム</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {platforms.map((p) => {
                        const available = p.status === "available";
                        const cardClass = available
                            ? "bg-gray-900 text-white rounded-2xl p-6 text-center font-bold tracking-wide"
                            : "border border-gray-300 text-gray-400 rounded-2xl p-6 text-center";
                        const content = available ? (
                            p.name
                        ) : (
                            <>
                                <p className="font-bold tracking-wide mb-1">{p.name}</p>
                                <p className="text-xs tracking-widest">対応予定</p>
                            </>
                        );

                        return p.url ? (
                            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className={`${cardClass} block transition-opacity hover:opacity-90`}>
                                {content}
                            </a>
                        ) : (
                            <div key={p.name} className={cardClass}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* これからのdolce */}
            <section className="container mx-auto px-6 py-20 text-left max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-gray-900">これからのdolce</h2>
                <div className="space-y-2 text-gray-600 mb-8">
                    <p>現在はAndroid・Windows・Linuxを中心に開発を進めています。iOS・macOSへの対応も計画中です。</p>
                    <p>ローカル完結・プライバシー重視という方針は変えず、これからも使いやすいリーダーを目指していきます。</p>
                </div>
                <a
                    href="https://github.com/rhing-official/dolce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-64 w-full max-w-sm mx-auto bg-white/50 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/40 hover:bg-white/80 hover:border-white hover:shadow-xl hover:shadow-blue-300/10 transition-all duration-500 rounded-lg overflow-hidden relative p-8"
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                                GITHUB
                            </h3>
                            <p className="text-2xl font-bold mt-2 text-gray-900 group-hover:text-black transition-colors">
                                開発の様子を見る
                            </p>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                dolceのリポジトリ
                            </span>
                            <div className="w-10 h-10 rounded-full border border-gray-300 bg-white/40 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-gray-800 transition-all duration-300 transform group-hover:translate-x-2">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </a>
            </section>
        </div>
    );
}
