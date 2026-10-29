"use client";

import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { firebaseApp } from "@/lib/firebase";

const storage = getStorage(firebaseApp);

// storage.rulesのstickerPackAssets/{creatorId}/...と対応。書き込みは
// 本人（creatorId===uid）のみ許可されている。
export async function uploadStickerPackAsset(uid: string, file: File): Promise<string> {
    const path = `stickerPackAssets/${uid}/${crypto.randomUUID()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

// ダウンロードURLからStorageのオブジェクトを削除する（下書きの画像の掃除用）。
// 既に無い・権限が無い等で失敗しても、呼び出し側の処理は止めない。
export async function deleteStickerPackAssetByUrl(url: string): Promise<void> {
    try {
        await deleteObject(ref(storage, url));
    } catch {
        // 掃除は、ベストエフォート
    }
}

// storage.rulesのdaidaiYokochoProfile/{userId}/...と対応。DaiDai本体の
// 身だしなみ（profileMaterials）とは独立したdaidai横丁専用プロフィール
// アイコン用（2026-08-16追加）。書き込みは本人のみ許可されている。
export async function uploadDaidaiProfileIcon(uid: string, file: File): Promise<string> {
    const path = `daidaiYokochoProfile/${uid}/${crypto.randomUUID()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

// storage.rulesのcontactAttachments/{fileName}と対応。お問い合わせフォームは
// 未ログインの一般訪問者も使うため認証無しでアップロード可能（画像のみ・5MB以下、
// 2026-09-11追加）。
export async function uploadContactAttachment(file: File): Promise<string> {
    const path = `contactAttachments/${crypto.randomUUID()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}
