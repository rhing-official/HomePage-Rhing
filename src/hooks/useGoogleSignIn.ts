"use client";

import { useCallback, useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
    GoogleAuthProvider,
    TotpMultiFactorGenerator,
    getMultiFactorResolver,
    signInWithCredential,
    type MultiFactorError,
    type MultiFactorResolver,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";

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
export function useGoogleSignIn(onSignedIn?: () => void) {
    const [buttonContainer, setButtonContainer] = useState<HTMLDivElement | null>(null);
    // callback ref: 呼び出し元のJSXでこのdivが実際に描画されている間だけ
    // GISボタンの初期化を行う（未ログイン時のみ表示、常時ポーリングしない）。
    const buttonContainerRef = useCallback((node: HTMLDivElement | null) => setButtonContainer(node), []);
    const [error, setError] = useState<string | null>(null);
    const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!buttonContainer) return;

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
    }, [buttonContainer]);

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
            onSignedIn?.();
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

    return { buttonContainerRef, error, resolver, code, setCode, submitTotpCode, submitting, cancelMfa };
}
