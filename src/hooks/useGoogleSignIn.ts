"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import {
    GoogleAuthProvider,
    TotpMultiFactorGenerator,
    getMultiFactorResolver,
    signInWithPopup,
    type MultiFactorError,
    type MultiFactorResolver,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";

// DaiDaiは2段階認証にTOTP（認証アプリ）のみ対応しSMSは非対応
// （技術仕様書2.4節参照）。GoogleログインしたDaiDaiアカウントに2段階認証が
// 設定されている場合、signInWithPopupは`auth/multi-factor-auth-required`で
// 一旦失敗し、TOTPコードによる追加確認（resolver.resolveSignIn）が必要になる。
export function useGoogleSignIn() {
    const [error, setError] = useState<string | null>(null);
    const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const signIn = async () => {
        setError(null);
        setResolver(null);
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (err) {
            if (err instanceof FirebaseError && err.code === "auth/multi-factor-auth-required") {
                // getMultiFactorResolverはFirebaseErrorではなくより厳密な
                // MultiFactorErrorを要求するが、code一致で実行時には十分検証済み
                setResolver(getMultiFactorResolver(auth, err as MultiFactorError));
                return;
            }
            if (
                err instanceof FirebaseError &&
                (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request")
            ) {
                // ユーザー操作によるキャンセルは静かに無視する
                return;
            }
            console.error("Googleログインに失敗しました:", err);
            setError(err instanceof FirebaseError ? err.code : "ログインに失敗しました");
        }
    };

    const submitTotpCode = async () => {
        if (!resolver) return;
        const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
        if (!hint) {
            setError("この認証方式（TOTP以外）には対応していません");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code.trim());
            await resolver.resolveSignIn(assertion);
            setResolver(null);
            setCode("");
        } catch (err) {
            console.error("2段階認証コードの確認に失敗しました:", err);
            setError(err instanceof FirebaseError ? err.code : "認証コードが正しくありません");
        } finally {
            setSubmitting(false);
        }
    };

    const cancelMfa = () => {
        setResolver(null);
        setCode("");
        setError(null);
    };

    return { signIn, error, resolver, code, setCode, submitTotpCode, submitting, cancelMfa };
}
