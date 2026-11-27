import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/siteConfig";

const UnderlineLink = ({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) => {
    const baseClasses = "group relative inline-block pb-1 text-on-surface font-bold tracking-wide transition-colors whitespace-nowrap text-sm xl:text-base";
    const underline = <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-current transition-all duration-300 group-hover:w-full"></span>;

    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
                {children}
                {underline}
            </a>
        );
    }
    return (
        <Link href={href} className={baseClasses}>
            {children}
            {underline}
        </Link>
    );
};

// フッターの「発信・交流」の並び。YouTubeは、動画を公開するまで載せない
const mediaGroups = [
    {
        label: "読む",
        links: [
            { name: "Zenn", href: siteConfig.socialLinks.zenn },
            { name: "Qiita", href: siteConfig.socialLinks.qiita },
            { name: "note", href: siteConfig.socialLinks.note },
        ],
    },
    {
        label: "集う",
        links: [{ name: "Discord", href: siteConfig.socialLinks.discord }],
    },
    {
        label: "話す",
        links: [
            { name: "X", href: siteConfig.socialLinks.x },
            { name: "Instagram", href: siteConfig.socialLinks.instagram },
            { name: "Karotter", href: siteConfig.socialLinks.karotter },
        ],
    },
    {
        label: "作る",
        links: [{ name: "GitHub", href: siteConfig.socialLinks.github }],
    },
];

export default function Footer() {
    return (
        <footer className="force-light w-full mt-24">
            {/* 左右2カラムの分割を lg（1024px以上）から適用 */}
            <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[400px]">

                {/* 左側：ロゴエリア */}
                <div className="w-full lg:w-1/3 flex items-center justify-center lg:justify-start p-12 lg:pl-24 bg-transparent">
                    <Link href="/">
                        <Image
                            src="/Rhing logo.svg"
                            alt="Rhing"
                            width={1000}
                            height={1000}
                        />
                    </Link>
                </div>

                {/* 右側：リンクエリア */}
                <div className="w-full lg:w-2/3 relative flex">
                    {/* 背景用のシェイプ（斜めカット） */}
                    <div className="absolute inset-0 bg-secondary-container lg:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] rounded-t-m3-xl lg:rounded-none"></div>

                    {/* 
                      🌟 修正ポイント2:
                      ・`lg:p-12` にすることで右側の不要な余白を削り、3カラムが横に広がれるスペースを増やします。
                      ・左余白を `lg:pl-[20%]` に調整し、斜めカット（15%）と文字との間の美しいバランスを保ちます。
                    */}
                    <div className="relative z-10 w-full p-12 md:p-16 lg:p-12 xl:p-24 lg:pl-[20%] xl:pl-[24%] grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-8">

                        {/* お問い合わせ */}
                        <div>
                            <h3 className="text-on-surface font-black text-lg xl:text-xl mb-6 tracking-widest border-b-2 border-on-surface/20 pb-3 pl-2 whitespace-nowrap">
                                お問い合わせ
                            </h3>
                            <ul className="space-y-4 pl-2">
                                <li><UnderlineLink href="/contact?type=user">ユーザー</UnderlineLink></li>
                                <li><UnderlineLink href="/contact?type=business">企業</UnderlineLink></li>
                            </ul>
                        </div>

                        {/* 法務関連 */}
                        <div>
                            <h3 className="text-on-surface font-black text-lg xl:text-xl mb-6 tracking-widest border-b-2 border-on-surface/20 pb-3 pl-2 whitespace-nowrap">
                                法務関連
                            </h3>
                            <ul className="space-y-4 pl-2">
                                <li><UnderlineLink href="/legal/charter">Rhing憲章</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/privacy">プライバシーポリシー</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/terms">利用規約</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/disclaimer">免責事項</UnderlineLink></li>
                                <li><UnderlineLink href="/legal/creator">クリエイター向けポリシー</UnderlineLink></li>
                                <li><UnderlineLink href="/about#tokushoho">特定商取引法に基づく表記</UnderlineLink></li>
                            </ul>
                        </div>

                        {/* 発信・交流。役割ごとに、小見出しで区切る（読む: 発信の本編、集う: コミュニティ、話す: SNS、作る: ソース） */}
                        <div>
                            <h3 className="text-on-surface font-black text-lg xl:text-xl mb-6 tracking-widest border-b-2 border-on-surface/20 pb-3 pl-2 whitespace-nowrap">
                                発信・交流
                            </h3>
                            <div className="space-y-5 pl-2">
                                {mediaGroups.map((group) => (
                                    <div key={group.label} className="flex flex-col gap-2 xl:flex-row xl:items-baseline xl:gap-4">
                                        <p className="shrink-0 text-xs font-bold tracking-widest text-on-surface-variant xl:w-10">{group.label}</p>
                                        <ul className="flex flex-wrap gap-x-5 gap-y-2">
                                            {group.links.map((link) => (
                                                <li key={link.name}>
                                                    <UnderlineLink href={link.href} external>{link.name}</UnderlineLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}