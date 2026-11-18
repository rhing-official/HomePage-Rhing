import { Metadata } from "next";
import CtaCard from "@/components/ui/CtaCard";
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
    BookOpen,
    ArrowRight,
    Palette,
    Play,
    ListTree,
} from "lucide-react";
import ScreenshotPlaceholder from "./ScreenshotPlaceholder";
import EnvironmentList from "@/components/EnvironmentList";

export const metadata: Metadata = {
    title: "dolce | Rhing",
    description: "本と、二人きり。PDF・CBZ・EPUB対応、ローカル完結のクロスプラットフォーム電子書籍/コミックリーダー",
};

const contents = [
    { href: "#features", label: "機能を見る" },
    { href: "#keys", label: "キー操作" },
    { href: "#platforms", label: "対応プラットフォーム" },
];

const pillars = [
    {
        icon: ShieldCheck,
        title: "ローカル完結",
        desc: "書籍データも設定も全て端末内に保存。クラウドへのアップロードは一切発生せず、ネット接続も不要です。",
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
        desc: "画面下部のピルに主要操作を集約し、片手でも迷わず操作出来ます。",
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

type Platform = { name: string; status: "available" | "planned"; url?: string; note?: string; caption?: string };

const keyRows: { keys: string; desc: string }[] = [
    { keys: "T", desc: "目次を開く" },
    { keys: "P", desc: "自動ページめくり" },
    { keys: "F5", desc: "本棚のディレクトリを再スキャン" },
    { keys: "← → / Space / Ctrl+F / Ctrl+B / Ctrl+I / F1 / Ctrl+T / Ctrl+W", desc: "その他のキー" },
];

const releasesUrl = "https://github.com/rhing-official/dolce/releases";

const platforms: Platform[] = [
    { name: "Android", status: "available", url: releasesUrl, note: "dolce-android.apk" },
    { name: "Windows", status: "available", url: releasesUrl, note: "dolce-windows.zip / *.msix" },
    { name: "Linux", status: "available", url: releasesUrl, note: "dolce-linux-x86_64.AppImage" },
    { name: "macOS", status: "available", url: releasesUrl, note: "dolce-macos.zip", caption: "動作未確認" },
    { name: "iOS", status: "planned" },
];

export default function DolcePage() {
    return (
        <div className="w-full text-gray-800 pb-32">
            {/* ヒーローエリア */}
            <div className="container mx-auto px-6 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-gray-900 mb-4">dolce</h1>
                <p className="text-xl md:text-2xl tracking-[0.2em] mb-8">「本と、二人きり」</p>
                <p className="text-gray-600 leading-relaxed text-pretty max-w-xl mx-auto mb-16">
                    PDF・CBZ・EPUB対応、ローカル完結のクロスプラットフォーム電子書籍/コミックリーダー
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
                        <div key={i} className="bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100 text-center">
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
                                複数の本棚タブを開いて、並行して読書・整理が出来ます。常駐サイドバーからは本棚の切り替えや検索もすぐに行えます。
                            </p>
                            <ul className="space-y-2 mt-6">
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <FolderOpen className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    ディレクトリを登録すると、階層のまま一覧表示
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <LayoutGrid className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    サムネイル表示・検索・複数選択
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <ListTree className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    巻数情報が全冊に有る時は巻数順、無い時はタイトルの自然順
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Keyboard className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    F5で、ディレクトリを再スキャン
                                </li>
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Linux) - 本棚グリッド表示]" aspect="video" />
                        </div>
                    </div>

                    {/* お気に入り・ディレクトリ管理（配置反転） */}
                    <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">ORGANIZE</span>
                            <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">お気に入り・ディレクトリ管理</h2>
                            <p className="text-gray-600 leading-relaxed text-pretty mb-6">
                                本や本棚をお気に入り登録したり、ディレクトリ単位で整理・削除したりできます。サイドバーからいつでもアクセス可能です。
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Star className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    本・本棚のお気に入り登録
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <FolderOpen className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    ディレクトリ単位での整理・削除
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
                                画面を3分割したタップ操作で、直感的にページを進められます。キーボードやページスライダーにも対応しています。
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
                                    キーボードショートカット。一覧は、下の「キー操作」を参照
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <ListTree className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    目次（PDF・EPUB）と、書籍内リンクのジャンプ。Tキーでも目次を開けます
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Play className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    自動ページめくり。再生ボタンを長押しすると秒数を選べ、Pキーでも操作出来ます
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <ArrowRight className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    同じディレクトリの前後の本へ移動。最終ページでは「次の本を開く」
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

                    {/* 見た目 */}
                    <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
                        <div className="w-full lg:w-1/2">
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">APPEARANCE</span>
                            <h2 className="text-2xl font-bold mb-4 tracking-wide text-gray-900 text-balance">版画風の見た目と、好みの色</h2>
                            <p className="text-gray-600 leading-relaxed text-pretty mb-6">
                                太い枠と硬い影の、版画風のUIです。アクセント色は、プリセットの10色から選ぶか、カラーコードで指定出来ます。気に入った色は、＋でプリセットに登録出来ます。表示言語は、日本語と英語です。
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-gray-700 text-sm">
                                    <Palette className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                    プリセット10色、またはカラーコード（#RRGGBB）
                                </li>
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <ScreenshotPlaceholder label="[SCREENSHOT: デスクトップ(Windows) - 見た目の設定画面（版画風UI・アクセント色）]" aspect="video" />
                        </div>
                    </div>
                </div>
            </section>

            {/* キー操作 */}
            <section id="keys" className="container mx-auto px-6 py-20 max-w-3xl">
                <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block text-center">KEYS</span>
                <h2 className="text-2xl font-bold mb-8 tracking-widest text-gray-900 text-center">キー操作</h2>
                <div className="overflow-x-auto bg-white rounded-m3-lg shadow-sm border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <tbody className="text-gray-600 divide-y divide-gray-100">
                            {keyRows.map((r) => (
                                <tr key={r.keys}>
                                    <th scope="row" className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap">{r.keys}</th>
                                    <td className="px-6 py-4">{r.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* モバイル専用UI（Android） */}
            <section className="container mx-auto px-6 py-20 bg-white/50 rounded-m3-xl max-w-6xl">
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
                        <div key={i} className="bg-white p-6 rounded-m3-lg shadow-sm border border-gray-100">
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
                <div className="flex flex-col md:flex-row justify-center gap-8 mb-8 max-w-3xl mx-auto">
                    <div className="flex-1 bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                        <FileText className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                        <h4 className="text-xl font-bold mb-2">PDF (.pdf)</h4>
                        <p className="text-gray-500 text-sm">電子書籍・文書</p>
                    </div>
                    <div className="flex-1 bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                        <Archive className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                        <h4 className="text-xl font-bold mb-2">CBZ (.cbz / .zip)</h4>
                        <p className="text-gray-500 text-sm">コミック・画像集</p>
                    </div>
                    <div className="flex-1 bg-white p-8 rounded-m3-lg shadow-sm border border-gray-100">
                        <BookOpen className="w-8 h-8 mx-auto mb-4 text-gray-700" strokeWidth={1.5} />
                        <h4 className="text-xl font-bold mb-2">EPUB (.epub)</h4>
                        <p className="text-gray-500 text-sm">リフロー表示の電子書籍</p>
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
                            ? "bg-gray-900 text-white rounded-m3-lg p-6 text-center font-bold tracking-wide"
                            : "border border-gray-300 text-gray-400 rounded-m3-lg p-6 text-center";
                        const content = available ? (
                            <>
                                <p>{p.name}</p>
                                {p.note && <p className="text-[0.7rem] font-medium tracking-wide text-gray-300 mt-1 break-all">{p.note}</p>}
                                {p.caption && <p className="text-xs font-medium tracking-widest text-gray-300 mt-1">{p.caption}</p>}
                            </>
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
                <div className="mt-8 text-sm text-gray-600 leading-relaxed space-y-3 text-left">
                    <p>配布は、GitHub Releasesのみです。</p>
                    <div className="bg-white rounded-m3-lg border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-2">Linux（AppImage）の使い方</h3>
                        <p>
                            ダウンロードしたAppImageに、<code className="font-mono text-gray-900">chmod +x</code>で実行権限を付けてから、実行します。FUSEが無い環境では、<code className="font-mono text-gray-900">--appimage-extract-and-run</code>を付けて実行します。
                        </p>
                    </div>
                    <p>macOS向けの配布は有りますが、動作を確認出来る環境が無いため、動作は確認していません。</p>
                </div>
                <EnvironmentList
                    className="mt-10 max-w-sm mx-auto text-left"
                    items={[
                        { os: "Windows 11" },
                        { os: "Zorin OS 18", detail: "Linux" },
                        { os: "Android 16" },
                    ]}
                    checkedAt="2026/9/15"
                />
            </section>

            {/* これからのdolce */}
            <section className="container mx-auto px-6 py-20 text-left max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 tracking-widest text-gray-900">これからのdolce</h2>
                <div className="space-y-2 text-gray-600 mb-8">
                    <p>現在はAndroid・Windows・Linuxを中心に開発を進めています。iOS・macOSへの対応も計画中です。</p>
                    <p>ローカル完結・プライバシー重視という方針は変えず、これからも使いやすいリーダーを目指していきます。</p>
                </div>
            </section>

            {/* CTA（横並び） */}
            <section className="container mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {[
                        { href: "https://github.com/rhing-official/dolce", label: "GITHUB", title: "開発の様子を見る", caption: "dolceのリポジトリ" },
                        { href: "https://gitdiagram.com/rhing-official/dolce", label: "DIAGRAM", title: "構成を図解する", caption: "コードの構成を見る" },
                    ].map((card) => (
                        <CtaCard key={card.href} href={card.href} label={card.label} title={card.title} caption={card.caption} />
                    ))}
                </div>
            </section>
        </div>
    );
}
