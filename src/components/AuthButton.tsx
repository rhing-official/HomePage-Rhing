"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// サインイン・サインアウトの実処理とログイン状態表示は/loginページに集約する。
// ここではログイン状態にかかわらず常に「ACCOUNT」固定表示のリンクのみ持つ
// （戻り先として現在のページを引き継ぐ）。
export default function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const href = `/login?redirect=${encodeURIComponent(pathname)}`;

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="group relative block py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
            ACCOUNT
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}
