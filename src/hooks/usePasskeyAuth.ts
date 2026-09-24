"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { signInWithCustomToken } from "firebase/auth";
import { startRegistration, startAuthentication, WebAuthnError } from "@simplewebauthn/browser";
import { auth } from "@/lib/firebaseAuth";
import {
    beginPasskeyRegistration,
    finishPasskeyRegistration,
    beginPasskeyAuthentication,
    finishPasskeyAuthentication,
    beginPasskeyRecovery as beginPasskeyRecoveryCall,
    finishPasskeyRecovery as finishPasskeyRecoveryCall,
} from "@/lib/firebaseFunctions";

// DaiDai本体（passkey_recovery_dialog.dartの_errorMessageFor）と同じ
// エラーコード対応・文言を踏襲する。
function errorMessageFor(err: unknown, context: "recovery" | "auth"): string {
    if (err instanceof FirebaseError) {
        switch (err.code) {
            case "functions/not-found":
                return "そのRhing Seedのアカウントが見つかりません。";
            case "functions/failed-precondition":
                return "このアカウントには復旧手段が設定されていません。";
            case "functions/resource-exhausted":
                return "試行回数が多すぎます。しばらくしてから再度お試しください。";
            case "functions/invalid-argument":
                return "入力内容が正しくありません。";
        }
    }
    if (err instanceof WebAuthnError || (err instanceof DOMException && err.name === "NotAllowedError")) {
        return "パスキーの操作がキャンセルされたか、利用できませんでした。";
    }
    return context === "recovery" ? "復旧に失敗しました。" : "パスキーでのログインに失敗しました。";
}

export interface PasskeyRecoveryQuestions {
    recoveryId: string;
    questions: string[];
}

export function usePasskeyAuth() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registerWithPasskey = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const { challengeId, options } = await beginPasskeyRegistration();
            const attestationResponse = await startRegistration({ optionsJSON: options });
            const { customToken } = await finishPasskeyRegistration({ challengeId, attestationResponse });
            await signInWithCustomToken(auth, customToken);
        } catch (err) {
            setError(errorMessageFor(err, "auth"));
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    const signInWithPasskey = async (rhingSeed: string) => {
        setSubmitting(true);
        setError(null);
        try {
            const { challengeId, options } = await beginPasskeyAuthentication({ rhingSeed });
            const assertionResponse = await startAuthentication({ optionsJSON: options });
            const { customToken } = await finishPasskeyAuthentication({ challengeId, assertionResponse });
            await signInWithCustomToken(auth, customToken);
        } catch (err) {
            setError(errorMessageFor(err, "auth"));
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    const beginRecovery = async (rhingSeed: string): Promise<PasskeyRecoveryQuestions | null> => {
        setSubmitting(true);
        setError(null);
        try {
            return await beginPasskeyRecoveryCall({ rhingSeed });
        } catch (err) {
            setError(errorMessageFor(err, "recovery"));
            return null;
        } finally {
            setSubmitting(false);
        }
    };

    const submitRecoveryAnswers = async (recoveryId: string, answers: string[]): Promise<boolean> => {
        setSubmitting(true);
        setError(null);
        try {
            const { customToken } = await finishPasskeyRecoveryCall({ recoveryId, answers });
            await signInWithCustomToken(auth, customToken);
            return true;
        } catch (err) {
            setError(errorMessageFor(err, "recovery"));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        error,
        setError,
        registerWithPasskey,
        signInWithPasskey,
        beginRecovery,
        submitRecoveryAnswers,
    };
}
