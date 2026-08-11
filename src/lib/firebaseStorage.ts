"use client";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
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
