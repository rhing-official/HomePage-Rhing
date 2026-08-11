"use client";

import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export const auth = getAuth(firebaseApp);

const LAST_ACTIVE_KEY = "daidai_last_active_at";
const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000; // 1週間

// サイトへのアクセスが1週間なければ自動ログアウトする。ページ読み込みのたびに
// 一度だけ判定し、ログイン中ならアクセス時刻を更新する（スライディングウィンドウ）。
// モジュールはシングルトンなので、このリスナーはアプリ全体で一度だけ登録される。
onAuthStateChanged(auth, (user) => {
    if (typeof window === "undefined") return;
    if (!user) {
        window.localStorage.removeItem(LAST_ACTIVE_KEY);
        return;
    }
    const lastActive = Number(window.localStorage.getItem(LAST_ACTIVE_KEY) ?? 0);
    if (lastActive && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
        window.localStorage.removeItem(LAST_ACTIVE_KEY);
        firebaseSignOut(auth);
        return;
    }
    window.localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
});

export function signOut() {
    if (typeof window !== "undefined") {
        window.localStorage.removeItem(LAST_ACTIVE_KEY);
    }
    return firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };
