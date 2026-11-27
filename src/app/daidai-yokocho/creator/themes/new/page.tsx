import type { Metadata } from "next";
import ThemePackSubmitForm from "./ThemePackSubmitForm";

// 意匠の投稿画面。まだ、メニューや一覧からはリンクしていない（手順①: 投稿の前の、機械の検査まで）
export const metadata: Metadata = {
    title: "意匠を投稿する | daidai横丁",
    robots: { index: false, follow: false },
};

export default function NewThemePackPage() {
    return <ThemePackSubmitForm />;
}
