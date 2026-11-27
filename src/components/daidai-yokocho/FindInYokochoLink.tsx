import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 一覧が空の時に出す「daidai横丁で探す」。押しやすいよう、幅いっぱいのブロックにする
export default function FindInYokochoLink({ href = "/daidai-yokocho" }: { href?: string }) {
    return (
        <Link
            href={href}
            className="group flex w-full items-center justify-between gap-4 rounded-m3-lg border border-gray-100 bg-white px-6 py-5 text-base font-bold text-gray-800 shadow-elevation-1 transition-all duration-300 hover:border-primary/30 hover:text-primary hover:shadow-elevation-2"
        >
            daidai横丁で探す
            <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
        </Link>
    );
}
