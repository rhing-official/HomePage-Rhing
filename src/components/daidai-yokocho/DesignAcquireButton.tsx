"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { acquireThemePack, uninstallThemePack } from "@/lib/firebaseFunctions";
import { isThemePackOwned } from "@/lib/themePackReview";

type Owned = "loading" | "owned" | "notOwned";

function errorText(err: unknown, fallback: string): string {
    return err instanceof Error && err.message ? err.message : fallback;
}

// 意匠の取得ボタン（無料のみ）。取得済みなら「取得済み」と外す操作、取り下げ・停止の後でも外せる
export default function DesignAcquireButton({ packId, status, redirectPath }: { packId: string; status: string; redirectPath: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [owned, setOwned] = useState<Owned>("loading");
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(
        () =>
            onAuthStateChanged(auth, (u) => {
                setUser(u);
                setAuthReady(true);
            }),
        [],
    );

    useEffect(() => {
        if (!authReady || !user) return;
        let cancelled = false;
        isThemePackOwned(user.uid, packId)
            .then((o) => !cancelled && setOwned(o ? "owned" : "notOwned"))
            .catch(() => !cancelled && setOwned("notOwned"));
        return () => {
            cancelled = true;
        };
    }, [authReady, user, packId]);

    const run = async (task: () => Promise<void>, fallback: string) => {
        setBusy(true);
        setError(null);
        try {
            await task();
        } catch (err) {
            setError(errorText(err, fallback));
        } finally {
            setBusy(false);
        }
    };

    const acquire = () =>
        run(async () => {
            await acquireThemePack({ packId });
            setOwned("owned");
        }, "取得に失敗しました");

    const uninstall = () =>
        run(async () => {
            await uninstallThemePack({ packId });
            setOwned("notOwned");
            setConfirming(false);
        }, "取得を外せませんでした");

    const base = "w-full rounded-full px-8 py-3 font-bold tracking-wide transition";
    if (!authReady) return <div className={`${base} h-12 bg-gray-100`} aria-hidden />;

    if (!user) {
        return status === "approved" ? (
            <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className={`${base} block text-center bg-primary text-on-primary hover:bg-primary/90`}>
                ログインして取得する
            </Link>
        ) : (
            <button type="button" disabled className={`${base} bg-primary text-on-primary opacity-40 cursor-not-allowed`}>
                取得できません
            </button>
        );
    }

    if (owned === "loading") return <div className={`${base} h-12 bg-gray-100`} aria-hidden />;

    if (owned === "owned") {
        return (
            <div className="flex flex-col gap-3">
                <button type="button" disabled className={`${base} flex items-center justify-center gap-2 border border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default`}>
                    <Check className="w-5 h-5" aria-hidden />
                    取得済み
                </button>
                {confirming ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-700">取得を外しますか？ 着せ替えが標準に戻ります。</span>
                        <button type="button" disabled={busy} onClick={uninstall} className="font-bold text-red-600 hover:text-red-800 disabled:opacity-40">
                            外す
                        </button>
                        <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-800">
                            やめる
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="self-start text-xs text-gray-500 hover:text-red-600 underline underline-offset-4">
                        取得を外す
                    </button>
                )}
                {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                disabled={busy || status !== "approved"}
                onClick={acquire}
                className={`${base} bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
                {status !== "approved" ? "取得できません" : busy ? "取得中…" : "取得する"}
            </button>
            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
        </div>
    );
}
