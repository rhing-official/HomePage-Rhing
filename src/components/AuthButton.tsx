"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";

// サインイン・サインアウトの実処理は/loginページに集約する。ここでは状態表示と
// /loginへの導線のみを持つ（戻り先として現在のページを引き継ぐ）。
export default function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setReady(true);
        });
    }, []);

    if (!ready) {
        return <span className="block py-3 px-4 w-24" aria-hidden />;
    }

    const href = `/login?redirect=${encodeURIComponent(pathname)}`;

    if (user) {
        return (
            <Link
                href={href}
                onClick={onNavigate}
                className="group relative flex items-center gap-2 py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
                {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                ) : (
                    <span className="w-6 h-6 rounded-full bg-gray-300 block" />
                )}
                <span className="max-w-[8em] truncate">{user.displayName ?? "アカウント"}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className="group relative block py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
            ログイン
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}
