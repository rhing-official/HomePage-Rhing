import { Metadata } from "next";

// 数値が入って公開できる段階になるまで、検索には出さない
export const metadata: Metadata = {
    title: "収支報告 | Rhing",
    description: "Rhingの月次および年次の収支報告を公開",
    robots: { index: false, follow: false },
};

export default function FinancialLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
