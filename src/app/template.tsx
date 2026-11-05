// 画面遷移のたびに再マウントされるので、新しいページが滲んで現れる（globals.cssの.page-blur-in）。
export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="page-blur-in">{children}</div>;
}
