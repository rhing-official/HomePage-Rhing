import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google"; // 🌟 Interから変更
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// 🌟 フォントの定義
const noto = Noto_Sans_JP({
    subsets: ["latin"],
    variable: '--font-noto-sans'
});

const mincho = Shippori_Mincho({
    subsets: ["latin"],
    weight: ["400"],
    variable: '--font-shippori-mincho'
});

export const metadata: Metadata = {
    title: "Rhing"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // 🌟 htmlタグに変数を注入し、bodyに font-sans を適用
        <html lang="ja" className={`${noto.variable} ${mincho.variable}`}>
            <body className="font-sans bg-[#fdfbf7] text-gray-900 min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow pt-20">
                    {children}
                </main>
                <Footer />
                <ScrollToTop />
            </body>
        </html>
    );
}