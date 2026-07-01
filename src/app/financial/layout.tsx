import { Metadata } from "next";

export const metadata: Metadata = {
    title: "収支報告 | Rhing",
    description: "Rhingの月次および年次の収支報告を公開",
};

export default function FinancialLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}