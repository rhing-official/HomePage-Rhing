import PageDots from "@/components/PageDots";

// 画面遷移のたびに再マウントされるので、新しいページが滲んで現れ（.page-blur-in）、
// ページ全体に薄い黄緑の水玉がぽつぽつと現れる（PageDots、.page-dot）。どちらもglobals.cssに定義している。
// ヘッダー・フッターはlayout側にあるので、水玉はかからない。
export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-blur-in">
            <PageDots />
            {children}
        </div>
    );
}
