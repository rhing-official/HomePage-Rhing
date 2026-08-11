"use client";

import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signInWithGoogle, signOut, type User } from "@/lib/firebaseAuth";

export default function AuthButton({ onNavigate }: { onNavigate?: () => void }) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            setUser(u);
            setReady(true);
        });
    }, []);

    // 認証状態が確定するまでは何も出さず、ログイン/ログアウトの一瞬の入れ替わりを見せない
    if (!ready) {
        return <span className="block py-3 px-4 w-24" aria-hidden />;
    }

    if (user) {
        return (
            <button
                onClick={() => {
                    signOut();
                    onNavigate?.();
                }}
                className="group relative flex items-center gap-2 py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
                title="ログアウト"
            >
                {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                ) : (
                    <span className="w-6 h-6 rounded-full bg-gray-300 block" />
                )}
                <span className="max-w-[8em] truncate">{user.displayName ?? "ログアウト"}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
        );
    }

    return (
        <button
            onClick={() => {
                signInWithGoogle().catch(() => {
                    // ポップアップを閉じた等のキャンセルは静かに無視する
                });
                onNavigate?.();
            }}
            className="group relative block py-3 px-4 font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
            ログイン
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </button>
    );
}
