"use client";

import { useCallback, useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
    GoogleAuthProvider,
    TotpMultiFactorGenerator,
    getMultiFactorResolver,
    getRedirectResult,
    signInWithCredential,
    signInWithRedirect,
    type UserCredential,
    type MultiFactorError,
    type MultiFactorResolver,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { isAuthRedirectHost } from "@/lib/authRedirect";
import { useTotpClipboardAutofill } from "@/hooks/useTotpClipboardAutofill";
import { parseTotpCode } from "@/lib/totpAutofill";

// Firebase Console > Authentication > Sign-in method > Google > Web SDKの設定 の値。
// クライアントに公開される前提の値であり秘密情報ではない（firebase.tsのAPIキー等と同様）。
const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
    "380243513330-n5mejgg1sberbkjhrtgf5qti6js9gf26.apps.googleusercontent.com";

// DaiDaiは2段階認証にTOTP（認証アプリ）のみ対応しSMSは非対応
// （技術仕様書2.4節参照）。GoogleログインしたDaiDaiアカウントに2段階認証が
// 設定されている場合、signInWithCredentialは`auth/multi-factor-auth-required`で
// 一旦失敗し、TOTPコードによる追加確認（resolver.resolveSignIn）が必要になる。
//
// signInWithPopup/signInWithRedirectではなくGoogle Identity Services(GIS)の
// IDトークン取得+signInWithCredentialを使う（2026-08-17変更）:
// FirebaseのsignInWithPopup/signInWithRedirectはどちらも、認証結果をアプリに
// 橋渡しする際に内部的に{authDomain}（daidai-rhing.firebaseapp.com）の隠しiframeを
// 経由する。FirefoxのTotal Cookie Protection（動的First-Partyアイソレーション）は
// このiframeをサードパーティ扱いし隔離されたストレージを割り当てるため、Googleの
// アカウント選択自体は成功するのに結果を一切受け取れず、ログインが完了しない不具合が
// 発生した（Chromeでもサードパーティストレージ制限が有効だと同様の症状になる）。
// GISはFedCMを念頭に設計されており、FirebaseのiframeブリッジをバイパスしてIDトークンを
// 直接取得できるため、この種のブロックの影響を受けない。
// リダイレクトでログインして戻ってきた時の結果は、ページ読み込みごとに一度だけ取得し、複数の呼び出し側
// （メニューとログイン画面）で共有する（DaiDaiの`awaitWebRedirectResult`と同じ）
let redirectResultPromise: Promise<UserCredential | null> | null = null;
function awaitRedirectResult(): Promise<UserCredential | null> {
    return (redirectResultPromise ??= getRedirectResult(auth));
}

export function useGoogleSignIn(onSignedIn?: () => void) {
    const [buttonContainer, setButtonContainer] = useState<HTMLDivElement | null>(null);
    // callback ref: 呼び出し元のJSXでこのdivが実際に描画されている間だけ
    // GISボタンの初期化を行う（未ログイン時のみ表示、常時ポーリングしない）。
    const buttonContainerRef = useCallback((node: HTMLDivElement | null) => setButtonContainer(node), []);
    const [error, setError] = useState<string | null>(null);
    const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    // ログインの方式。本番ドメインは、同じタブのリダイレクト、それ以外はGISのボタン（ポップアップ）。
    // ハイドレーションのずれを避けるため、マウント後に決める（それまでは、ボタンを出さない）
    const [mode, setMode] = useState<"pending" | "redirect" | "gis">("pending");
    const [redirecting, setRedirecting] = useState(false);
    useEffect(() => {
        setMode(isAuthRedirectHost(window.location.hostname) ? "redirect" : "gis");
    }, []);

    useEffect(() => {
        if (!buttonContainer || mode !== "gis") return;

        const handleCredential = async (response: { credential?: string }) => {
            setError(null);
            setResolver(null);
            if (!response?.credential) {
                setError("Googleからのログイン情報を取得できませんでした");
                return;
            }
            try {
                const credential = GoogleAuthProvider.credential(response.credential);
                await signInWithCredential(auth, credential);
                onSignedIn?.();
            } catch (err) {
                if (err instanceof FirebaseError && err.code === "auth/multi-factor-auth-required") {
                    try {
                        setResolver(getMultiFactorResolver(auth, err as MultiFactorError));
                    } catch {
                        setError("2段階認証の準備に失敗しました");
                    }
                    return;
                }
                console.error("Googleログインに失敗しました:", err);
                setError(err instanceof FirebaseError ? err.code : "ログインに失敗しました");
            }
        };

        // レイアウト側で読み込んだGISスクリプト（https://accounts.google.com/gsi/client）の
        // 読み込み完了を待ってから初期化する。afterInteractiveで先読みされているが、
        // このコンポーネントのマウントの方が早く終わる場合があるため短時間だけ待つ。
        let cancelled = false;
        let attempts = 0;
        const trySetup = () => {
            if (cancelled) return;
            if (!window.google?.accounts?.id) {
                if (attempts++ < 100) requestAnimationFrame(trySetup);
                return;
            }
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredential,
            });
            window.google.accounts.id.renderButton(buttonContainer, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "pill",
                locale: "ja",
            });
        };
        trySetup();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- buttonContainerが現れた時のみ初期化する
    }, [buttonContainer, mode]);

    // 同じタブでGoogleの画面へ移る。ログイン後は、この画面に戻り、下の効果で結果を受け取る
    const startGoogleRedirect = async () => {
        setError(null);
        setResolver(null);
        setRedirecting(true);
        try {
            await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (err) {
            console.error("Googleログインへの移動に失敗しました:", err);
            setError(err instanceof FirebaseError ? err.code : "ログインに失敗しました");
            setRedirecting(false);
        }
    };

    // リダイレクトで戻ってきた時の結果を受け取る（成功なら認証状態に反映済み）
    useEffect(() => {
        if (mode !== "redirect") return;
        let cancelled = false;
        awaitRedirectResult()
            .then((credential) => {
                if (!cancelled && credential) onSignedIn?.();
            })
            .catch((err) => {
                if (cancelled) return;
                if (err instanceof FirebaseError && err.code === "auth/multi-factor-auth-required") {
                    try {
                        setResolver(getMultiFactorResolver(auth, err as MultiFactorError));
                    } catch {
                        setError("2段階認証の準備に失敗しました");
                    }
                    return;
                }
                console.error("Googleログインに失敗しました:", err);
                setError(err instanceof FirebaseError ? err.code : "ログインに失敗しました");
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- onSignedInは、最初の呼び出しのものでよい（結果の受け取りは1回だけ）
    }, [mode]);

    // overrideCode: クリップボードからの自動入力では、状態の更新を待たずに、取り出した6桁をそのまま渡す
    const submitTotpCode = async (overrideCode?: string) => {
        if (!resolver) return;
        const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
        if (!hint) {
            setError("この認証方式（TOTP以外）には対応していません");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const assertion = TotpMultiFactorGenerator.assertionForSignIn(
                hint.uid,
                (typeof overrideCode === "string" ? overrideCode : code).trim(),
            );
            await resolver.resolveSignIn(assertion);
            setResolver(null);
            setCode("");
            onSignedIn?.();
        } catch (err) {
            console.error("2段階認証コードの確認に失敗しました:", err);
            setError(err instanceof FirebaseError ? err.code : "認証コードが正しくありません");
        } finally {
            setSubmitting(false);
        }
    };

    // 2段階認証の入力欄が出ていて、送信中でない間だけ、クリップボードの6桁を自動入力・自動確定する。
    useTotpClipboardAutofill({
        active: resolver !== null && !submitting,
        onCode: (autofilledCode) => {
            setCode(autofilledCode);
            void submitTotpCode(autofilledCode);
        },
    });

    // 入力欄に6桁を貼り付けた時は、権限が不要なので、全てのブラウザで確定できる（クリップボードの自動読み取りの保険）
    const handleCodePaste = (pastedText: string): boolean => {
        const pasted = parseTotpCode(pastedText);
        if (pasted === null || submitting) return false;
        setCode(pasted);
        void submitTotpCode(pasted);
        return true;
    };

    const cancelMfa = () => {
        setResolver(null);
        setCode("");
        setError(null);
    };

    // 全角入力(IME変換等)でも半角に強制し、TOTPコードの桁数(6桁)を超えて
    // 入力できないようにする。
    const handleCodeChange = (value: string) => {
        setCode(value.normalize("NFKC").slice(0, 6));
    };

    return { mode, redirecting, startGoogleRedirect, buttonContainerRef, error, resolver, code, setCode, handleCodeChange, handleCodePaste, submitTotpCode, submitting, cancelMfa };
}
