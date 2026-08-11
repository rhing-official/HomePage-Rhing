import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// DaiDaiアプリと同一のFirebaseプロジェクト（daidai-rhing）を使う。
// これらの値はクライアントに公開される前提の設定値であり秘密情報ではない
// （アクセス制御はFirestore/Storageのセキュリティルール側で行う）。
// .env.local（gitignore対象）で上書きできるが、未設定でも動くようDaiDai側の
// 既存Web app設定（lib/firebase_options.dartのFirebaseOptions.web）を
// デフォルト値として埋め込んでいる。
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAuX1o4MrRfacN4sQ_TMYrMl7PZXydQni4",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "daidai-rhing.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "daidai-rhing",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "daidai-rhing.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "380243513330",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:380243513330:web:13d8bb20cd82bace0e656b",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
