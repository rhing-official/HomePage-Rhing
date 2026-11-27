import Script from "next/script";
import { Kiwi_Maru } from "next/font/google";
import "./globals.css";
import SiteLogo from "@/components/SiteLogo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop"; // 🌟 復活
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const kiwiMaru = Kiwi_Maru({
    weight: ["300", "400", "500"],
    subsets: ["latin"],
    variable: "--font-kiwi-maru",
    // 日本語フォントは、多数のファイルに分割されていて、先読みを有効にすると、全てをページごとに
    // 先読みしてしまう（応答ヘッダーに45個）。先読みを止め、使う文字の分だけ、必要になってから取る
    // （VPNなど細い回線で重くなるのを避ける、2026-11-17）
    preload: false,
    display: "swap",
});

// 🌟 メタデータ設定（すでにご自身でカスタマイズされている場合はそのままで大丈夫です）
export const metadata = {
    title: "Rhing",
    description: "Rhing Web",
    openGraph: { siteName: "Rhing" },
};

// ダークモードに対応している印。ブラウザの組み込みの部品と、Dark Readerなどの拡張が、二重に変換しないための手掛かりになる
export const viewport = { colorScheme: "light dark" };

// Googleの検索結果に表示されるサイト名を「Rhing」にするための構造化データ
const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rhing",
    alternateName: ["リング"],
    url: "https://rhing.jp/",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        /* 
          🌟 Dark Reader対策の suppressHydrationWarning はこの位置に残します
        */
        <html lang="ja" className={kiwiMaru.variable} suppressHydrationWarning>
            <head>
                {/* 描画の前に、保存済みの設定かOSの設定から、dark クラスを付ける（ライトで一瞬描かれてから暗くなる、ちらつきを避ける） */}
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            {/* 
              🌟 修正ポイント: 
              bodyタグの内側で、このように <Header />, <main>, <Footer />, <ScrollToTop /> 
              をそれぞれ元通りに呼び出すことで、画面の上下の表示が完全に復活します。
              
              ※bodyの className（Googleフォント等の設定等）は、既にお使いのものがあればそのまま残して適用してください。
            */}
            <body className="min-h-screen flex flex-col justify-between bg-surface text-on-surface font-sans fold:pl-[var(--fold-content-start)]" suppressHydrationWarning>
                {/* Google Identity Services（daidai横丁のGoogleログインボタン用） */}
                <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />

                {/* ヘッダーの読み込み */}
                <Header />

                {/* メインコンテンツエリア */}
                {/* ヘッダー（ロゴ・ナビ）がfixed/absoluteでドキュメントの流れから外れているため、ここで上余白を確保する */}
                {/* page-frame と page-shell は、スマホ縦画面でドロワーを開いた間、ページを傾けて奥へ退かせるための包み（Header.tsx、globals.css）。
                    通常時は、見た目も配置も変えない。ヘッダー・ドロワーは、この外に置く */}
                <div className="page-frame flex flex-grow flex-col">
                    <div className="page-shell relative flex flex-grow flex-col">
                        {/* ロゴは、ページの一部。ドロワーを開いて、ページが傾く時に、一緒に動く（page-shell が基準） */}
                        <SiteLogo />
                        <main className="flex-grow flex flex-col pt-28 lg:pt-40 fold:pt-12">
                            {children}
                        </main>

                        {/* フッターの読み込み */}
                        <Footer />
                    </div>
                </div>

                {/* スクロールトップボタンの読み込み。ドロワーを開いた間、ページの傾きに追従させる為、枠と同じ動きをする専用の層に置く。
                    枠の中に置くと、傾きを解く瞬間に、置き場が付け替わって、1コマ消えて揺れる */}
                <div className="page-overlay">
                    <ScrollToTop />
                </div>
            </body>
        </html>
    );
}