"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebaseAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import AccountDeleteDialog from "@/components/AccountDeleteDialog";

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect");

    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const deleted = searchParams.get("deleted");

    // 「すでにログイン済みでこのページを開いた」場合は戻さない
    // （アカウント情報やログアウトボタンを見せる必要があるため）。
    // 戻すのは「このページでの操作によって今まさにログインが完了した」場合のみ。
    const redirectIfSignedIn = () => {
        if (redirectTo && auth.currentUser) {
            router.replace(redirectTo);
        }
    };

    const { buttonContainerRef, error, resolver, code, setCode, submitTotpCode, submitting, cancelMfa } =
        useGoogleSignIn(redirectIfSignedIn);

    const handleAccountDeleted = async (mode: "requested" | "immediate") => {
        setShowDeleteDialog(false);
        await signOut();
        router.replace(`/login?deleted=${mode}`);
    };

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    if (!ready) return null;

    return (
        <div className="container mx-auto px-6 py-32 max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ログイン</h1>

            {user ? (
                <div className="flex flex-col items-center gap-4">
                    {user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-full" />
                    ) : (
                        <span className="w-16 h-16 rounded-full bg-gray-300 block" />
                    )}
                    <p className="font-bold text-gray-900">{user.displayName ?? "DaiDaiアカウント"}</p>
                    {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                    <div className="mt-2 flex flex-col items-stretch gap-2 w-full">
                        <Link
                            href="/daidai-yokocho/owned"
                            className="px-8 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-white/90 hover:shadow-md hover:shadow-blue-300/15 transition-all duration-300 text-center"
                        >
                            所持しているペタピタを管理
                        </Link>
                        <Link
                            href="/daidai-yokocho/creator"
                            className="px-8 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-white/90 hover:shadow-md hover:shadow-blue-300/15 transition-all duration-300 text-center"
                        >
                            出品したペタピタを管理
                        </Link>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="mt-2 px-8 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                        ログアウト
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                        アカウントを削除
                    </button>
                    <AnimatePresence>
                        {showDeleteDialog && (
                            <AccountDeleteDialog
                                uid={user.uid}
                                onClose={() => setShowDeleteDialog(false)}
                                onDeleted={handleAccountDeleted}
                            />
                        )}
                    </AnimatePresence>
                </div>
            ) : resolver ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (submitting || !code.trim()) return;
                        submitTotpCode();
                    }}
                    className="flex flex-col items-center gap-3"
                >
                    <p className="text-sm text-gray-600">認証アプリの6桁コードを入力してください</p>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        inputMode="numeric"
                        autoFocus
                        className="w-40 text-center rounded-lg border border-gray-300 px-4 py-2 text-lg tracking-widest"
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={cancelMfa}
                            className="px-6 py-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !code.trim()}
                            className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600 transition shadow disabled:opacity-50"
                        >
                            {submitting ? "確認中..." : "確認"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    {deleted === "requested" && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            アカウント削除を申請しました。30日以内に再度ログインすると取り消せます。
                        </p>
                    )}
                    {deleted === "immediate" && (
                        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            アカウントを削除しました。ご利用ありがとうございました。
                        </p>
                    )}
                    <p className="text-gray-500 mb-2">DaiDaiアカウント（Google）でログインします。</p>
                    <div ref={buttonContainerRef} />
                </div>
            )}

            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
        </div>
    );
}
