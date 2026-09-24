import Script from "next/script";
import { Kiwi_Maru } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop"; // 🌟 復活

const kiwiMaru = Kiwi_Maru({
    weight: ["300", "400", "500"],
    subsets: ["latin"],
    variable: "--font-kiwi-maru",
});

// 🌟 メタデータ設定（すでにご自身でカスタマイズされている場合はそのままで大丈夫です）
export const metadata = {
    title: "Rhing",
    description: "Rhing Web",
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
            {/* 
              🌟 修正ポイント: 
              bodyタグの内側で、このように <Header />, <main>, <Footer />, <ScrollToTop /> 
              をそれぞれ元通りに呼び出すことで、画面の上下の表示が完全に復活します。
              
              ※bodyの className（Googleフォント等の設定など）は、すでにお使いのものがあればそのまま残して適用してください。
            */}
            <body className="min-h-screen flex flex-col justify-between bg-[#fcfbf7] font-sans">
                {/* Google Identity Services（daidai横丁のGoogleログインボタン用） */}
                <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

                {/* ヘッダーの読み込み */}
                <Header />

                {/* メインコンテンツエリア */}
                {/* ヘッダー（ロゴ・ナビ）がfixed/absoluteでドキュメントの流れから外れているため、ここで上余白を確保する */}
                <main className="flex-grow pt-28 lg:pt-40">
                    {children}
                </main>

                {/* フッターの読み込み */}
                <Footer />

                {/* スクロールトップボタンの読み込み */}
                <ScrollToTop />
            </body>
        </html>
    );
}