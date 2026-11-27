import Link from "next/link";
import Image from "next/image";

// 左上のロゴ。ページの先頭に、絶対配置で置く（スクロールすると、ページと一緒に流れる）。
// layout.tsx の page-shell の中に置く。ドロワーを開いて、ページが傾く間、ロゴも、ページの一部として、一緒に傾いて動く。
// 画面が左右2つに分かれる端末（fold）では、左のサイドメニューの中に、ロゴが有るので、出さない
export default function SiteLogo() {
    return (
        <div className="absolute top-0 left-0 p-6 lg:p-8 z-50 fold:hidden">
            <Link href="/" className="inline-block">
                <Image
                    src="/Rhing logo.svg"
                    alt="Rhing"
                    width={240}
                    height={80}
                    priority
                    className="h-10 lg:h-20 w-auto aspect-[3/1] object-contain"
                />
            </Link>
        </div>
    );
}
