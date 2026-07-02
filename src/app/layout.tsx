import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop"; // 🌟 復活

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
        <html lang="ja" suppressHydrationWarning>
            {/* 
              🌟 修正ポイント: 
              bodyタグの内側で、このように <Header />, <main>, <Footer />, <ScrollToTop /> 
              をそれぞれ元通りに呼び出すことで、画面の上下の表示が完全に復活します。
              
              ※bodyの className（Googleフォント等の設定など）は、すでにお使いのものがあればそのまま残して適用してください。
            */}
            <body className="min-h-screen flex flex-col justify-between bg-[#fcfbf7] font-sans">
                {/* ヘッダーの読み込み */}
                <Header />

                {/* メインコンテンツエリア */}
                <main className="flex-grow">
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