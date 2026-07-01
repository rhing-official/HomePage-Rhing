import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/siteConfig";

// リンクにホバーした際、左から下線が引かれるアニメーション用の共通部品
const UnderlineLink = ({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) => {
    const baseClasses = "group relative inline-block pb-1 text-gray-800 font-bold tracking-wide hover:text-black transition-colors";
    const underline = <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-900 transition-all duration-300 group-hover:w-full"></span>;

    // 外部サイト（note, GitHubなど）の場合は別タブで開く <a> タグにする
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
                {children}
                {underline}
            </a>
        );
    }
    // サイト内のページ遷移の場合は <Link> タグにする
    return (
        <Link href={href} className={baseClasses}>
            {children}
            {underline}
        </Link>
    );
};

export default function Footer() {
    return (
        <footer className="w-full mt-24">
            <div className="w-full flex flex-col md:flex-row items-stretch min-h-[400px]">

                {/* 左側：ロゴエリア */}
                <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start p-12 md:pl-24 bg-transparent">
                    <Link href="/">
                        <Image
                            src="/Rhing.svg"
                            alt="Rhing Logo"
                            width={1000}
                            height={1000}
                        />
                    </Link>
                </div>

                {/* 右側：リンクエリア（ATLUS風の斜め背景） */}
                <div className="w-full md:w-2/3 relative flex">
                    {/* 
                      背景用のシェイプ
                      PC(md以上)では clip-path を使って左辺を斜めにカット。
                      スマホ画面ではただの角丸になります。
                    */}
                    <div className="absolute inset-0 bg-[#f0cabb] md:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] rounded-t-[3rem] md:rounded-none"></div>

                    {/* リンク群の中身 */}
                    <div className="relative z-10 w-full p-12 md:p-24 md:pl-64 grid grid-cols-1 sm:grid-cols-3 gap-12">

                        {/* お問い合わせ */}
                        <div>
                            {/* 🌟 <h3> に pl-4 を追加して、文字だけ右へ */}
                            <h3 className="text-gray-900 font-black text-xl mb-6 tracking-widest border-b-2 border-gray-900/20 pb-3 pl-2">
                                お問い合わせ
                            </h3>
                            {/* 🌟 <ul> に pl-4 を追加して、リンクも右へ */}
                            <ul className="space-y-4 pl-2">
                                <li><UnderlineLink href="/contact?type=user">ユーザー</UnderlineLink></li>
                                <li><UnderlineLink href="/contact?type=business">企業</UnderlineLink></li>
                            </ul>
                        </div>

                        {/* 法務関連 */}
                        <div>
                            {/* 🌟 <h3> に pl-4 を追加 */}
                            <h3 className="text-gray-900 font-black text-xl mb-6 tracking-widest border-b-2 border-gray-900/20 pb-3 pl-2">
                                法務関連
                            </h3>
                            {/* 🌟 <ul> に pl-4 を追加 */}
                            <ul className="space-y-4 pl-2">
                                <li><UnderlineLink href="/legal/charter">Rhing憲章</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/privacy">プライバシーポリシー</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/terms">利用規約</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/disclaimer">免責事項</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/creator">クリエイター向けポリシー</UnderlineLink></li>
                            </ul>
                        </div>

                        {/* メディア */}
                        <div>
                            {/* 🌟 <h3> に pl-4 を追加 */}
                            <h3 className="text-gray-900 font-black text-xl mb-6 tracking-widest border-b-2 border-gray-900/20 pb-3 pl-2">
                                メディア
                            </h3>
                            {/* 🌟 <ul> に pl-4 を追加 */}
                            <ul className="space-y-4 pl-2">
                                <li><UnderlineLink href={siteConfig.socialLinks.note} external>note</UnderlineLink></li>
                                <li><UnderlineLink href={siteConfig.socialLinks.github} external>GitHub</UnderlineLink></li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}