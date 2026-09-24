"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound } from "lucide-react";
import { db } from "@/lib/firebase";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebaseAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import AccountDeleteDialog from "@/components/AccountDeleteDialog";
import PersonIcon from "./PersonIcon";
import ProfileEditModal from "./ProfileEditModal";
import OnboardingModal from "./OnboardingModal";
import PasskeySignInDialog from "./PasskeySignInDialog";
import PasskeyRecoveryDialog from "./PasskeyRecoveryDialog";
import { usePasskeyAuth } from "@/hooks/usePasskeyAuth";

interface OwnProfile {
    rhingSeed: string;
    nickname: string | null;
    iconUrl: string | null;
    onboarded: boolean;
}

// users/{uid}はログイン済みユーザーなら誰でも読めるため、本人の分もクライアント
// から直接読む。呼び名・アイコンはdaidai横丁専用のdaidaiNickname/daidaiIconUrl
// のみを見る（DaiDai本体の身だしなみ=icons[]/nicknames[]は借用しない。
// 初回ログイン時にOnboardingModalで本人に設定してもらう設計のため）。
async function fetchOwnProfile(uid: string): Promise<OwnProfile | null> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid));
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        return {
            rhingSeed: typeof data.rhingSeed === "string" ? data.rhingSeed : "",
            nickname: typeof data.daidaiNickname === "string" ? data.daidaiNickname : null,
            iconUrl: typeof data.daidaiIconUrl === "string" ? data.daidaiIconUrl : null,
            onboarded: data.daidaiOnboarded === true,
        };
    } catch {
        return null;
    }
}

const menuItemClass =
    "block w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-700 font-bold hover:bg-white/70 hover:text-blue-600 transition-colors";

export default function DaidaiYokochoMenu() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [profile, setProfile] = useState<OwnProfile | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showPasskeySignIn, setShowPasskeySignIn] = useState(false);
    const [showPasskeyRecovery, setShowPasskeyRecovery] = useState(false);
    const { buttonContainerRef, error, resolver, code, handleCodeChange, submitTotpCode, submitting, cancelMfa } =
        useGoogleSignIn();
    const { submitting: registeringPasskey, error: passkeyRegisterError, registerWithPasskey } = usePasskeyAuth();

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        fetchOwnProfile(user.uid).then((p) => {
            if (cancelled) return;
            setProfile(p);
            // 初回ログイン（daidaiOnboarded未達成）ならアカウントメニューを
            // 開かなくても自動でオンボーディングを表示する。
            if (p && !p.onboarded) setShowOnboarding(true);
        });
        return () => {
            cancelled = true;
        };
    }, [user]);

    // パネル外クリックで閉じる（ドロップダウンなので暗いオーバーレイは使わない）。
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // ログアウト直後も直前のプロフィールを表示し続けないよう、描画時にuserと
    // 突き合わせる（setState-in-effectを避けるため、effect内ではリセットしない）。
    const displayProfile = user ? profile : null;

    const close = () => setOpen(false);

    const handleAccountDeleted = async () => {
        setShowDeleteDialog(false);
        close();
        await signOut();
    };

    return (
        <>
            <div ref={containerRef} className="fixed top-24 right-6 lg:top-28 lg:right-8 z-40">
                <button
                    onClick={() => setOpen((o) => !o)}
                    aria-label="アカウント設定を開く"
                    className="block p-0.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/60 shadow-blue-300/10 hover:bg-white/90 transition-all duration-300 overflow-hidden"
                >
                    {displayProfile?.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={displayProfile.iconUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                        <span className="flex items-center justify-center w-11 h-11">
                            <PersonIcon className="w-6 h-6 text-gray-700" />
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-72 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/70 p-4 flex flex-col gap-2"
                        >
                            <div className="mb-1">
                                {!authReady ? null : user ? (
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            setShowProfileEdit(true);
                                        }}
                                        className="flex items-center gap-3 px-1 py-1.5 w-full rounded-xl hover:bg-white/70 transition-colors"
                                    >
                                        {displayProfile?.iconUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={displayProfile.iconUrl}
                                                alt=""
                                                className="w-12 h-12 rounded-full object-cover border border-white/80 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                                        )}
                                        <div className="min-w-0 text-left">
                                            <p className="font-bold text-gray-900 truncate">
                                                {displayProfile?.nickname ?? user.displayName ?? "DaiDaiアカウント"}
                                            </p>
                                            {displayProfile?.rhingSeed && (
                                                <p className="text-xs text-gray-400 truncate">@{displayProfile.rhingSeed}</p>
                                            )}
                                        </div>
                                    </button>
                                ) : resolver ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (submitting || !code.trim()) return;
                                            submitTotpCode();
                                        }}
                                        className="flex flex-col gap-3 px-1"
                                    >
                                        <p className="text-sm text-gray-600">認証アプリの6桁コードを入力してください</p>
                                        <input
                                            value={code}
                                            onChange={(e) => handleCodeChange(e.target.value)}
                                            placeholder="123456"
                                            inputMode="numeric"
                                            maxLength={6}
                                            autoFocus
                                            className="w-full text-center rounded-lg border border-gray-300 px-4 py-2 text-lg tracking-widest"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={cancelMfa}
                                                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition text-sm"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting || !code.trim()}
                                                className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition shadow disabled:opacity-50 text-sm"
                                            >
                                                {submitting ? "確認中..." : "確認"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div ref={buttonContainerRef} />
                                        <div className="w-full border-t border-gray-200/70" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(false);
                                                setShowPasskeySignIn(true);
                                            }}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-white/70 transition-colors"
                                        >
                                            <KeyRound className="w-4 h-4" />
                                            パスキーでログイン
                                        </button>
                                        <button
                                            type="button"
                                            disabled={registeringPasskey}
                                            onClick={async () => {
                                                try {
                                                    await registerWithPasskey();
                                                    setOpen(false);
                                                } catch {
                                                    // エラー表示はpasskeyRegisterErrorに反映済み
                                                }
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {registeringPasskey ? "作成中..." : "Rhing Seedでアカウントを作成"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpen(false);
                                                setShowPasskeyRecovery(true);
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                                        >
                                            パスキーが使えない場合
                                        </button>
                                        {passkeyRegisterError && (
                                            <p className="text-xs text-red-600">{passkeyRegisterError}</p>
                                        )}
                                    </div>
                                )}
                                {error && <p className="mt-2 text-xs text-red-600 px-1">{error}</p>}
                            </div>

                            {user && !resolver && (
                                <div className="flex flex-col gap-0.5 border-t border-gray-200/70 pt-2">
                                    <Link href="/daidai-yokocho/owned" onClick={close} className={menuItemClass}>
                                        購入済みのぺったん
                                    </Link>
                                    <Link href="/daidai-yokocho/follows" onClick={close} className={menuItemClass}>
                                        フォロー中のクリエイター
                                    </Link>
                                    <Link href="/daidai-yokocho/favorites" onClick={close} className={menuItemClass}>
                                        お気に入りのぺったん
                                    </Link>
                                    <Link href="/daidai-yokocho/creator" onClick={close} className={menuItemClass}>
                                        ぺったんの作成と管理
                                    </Link>
                                    <button
                                        onClick={() => {
                                            close();
                                            signOut();
                                        }}
                                        className={menuItemClass}
                                    >
                                        ログアウト
                                    </button>
                                    <button
                                        onClick={() => {
                                            close();
                                            setShowDeleteDialog(true);
                                        }}
                                        className={`${menuItemClass} text-red-600 hover:text-red-700`}
                                    >
                                        アカウント削除
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showProfileEdit && user && (
                <AnimatePresence>
                    <ProfileEditModal
                        uid={user.uid}
                        current={{
                            nickname: displayProfile?.nickname ?? null,
                            iconUrl: displayProfile?.iconUrl ?? null,
                            rhingSeed: displayProfile?.rhingSeed ?? "",
                        }}
                        onClose={() => setShowProfileEdit(false)}
                        onSaved={(next) => {
                            setProfile((prev) => (prev ? { ...prev, ...next } : prev));
                            setShowProfileEdit(false);
                        }}
                    />
                </AnimatePresence>
            )}

            {showOnboarding && user && (
                <AnimatePresence>
                    <OnboardingModal
                        uid={user.uid}
                        onDone={(next) => {
                            setProfile((prev) => (prev ? { ...prev, ...next, onboarded: true } : prev));
                            setShowOnboarding(false);
                        }}
                    />
                </AnimatePresence>
            )}

            {showPasskeySignIn && (
                <AnimatePresence>
                    <PasskeySignInDialog
                        onClose={() => setShowPasskeySignIn(false)}
                        onSignedIn={() => setShowPasskeySignIn(false)}
                    />
                </AnimatePresence>
            )}

            {showPasskeyRecovery && (
                <AnimatePresence>
                    <PasskeyRecoveryDialog
                        onClose={() => setShowPasskeyRecovery(false)}
                        onRecovered={() => setShowPasskeyRecovery(false)}
                    />
                </AnimatePresence>
            )}

            {showDeleteDialog && user && (
                <AnimatePresence>
                    <AccountDeleteDialog
                        uid={user.uid}
                        onClose={() => setShowDeleteDialog(false)}
                        onDeleted={handleAccountDeleted}
                    />
                </AnimatePresence>
            )}
        </>
    );
}
