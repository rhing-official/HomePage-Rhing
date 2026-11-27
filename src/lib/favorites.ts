import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStickerPackById, type StickerPack } from "@/lib/stickerPacks";
import { timestampToMillis } from "@/lib/mixedList";

// users/{uid}/favoritePacks/{packId}はDaiDai репо firestore.rulesにより
// 本人のみ読み書き可能。ドキュメントが存在すること自体がお気に入りの印
// （followsと同型、2026-08-13追加）。

export async function isPackFavorited(uid: string, packId: string): Promise<boolean> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid, "favoritePacks", packId));
        return snapshot.exists();
    } catch {
        return false;
    }
}

export async function addFavoritePack(uid: string, packId: string): Promise<void> {
    await setDoc(doc(db, "users", uid, "favoritePacks", packId), {
        createdAt: serverTimestamp(),
    });
}

export async function removeFavoritePack(uid: string, packId: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "favoritePacks", packId));
}

export async function getFavoritePackIds(uid: string): Promise<string[]> {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "favoritePacks"));
        return snapshot.docs.map((d) => d.id);
    } catch {
        return [];
    }
}

// 追加した時刻つきのお気に入り（存在しない・読めないぺったんは除く）。1つの一覧に混ぜて並べる為
export async function getFavoritedStickerEntries(uid: string): Promise<{ pack: StickerPack; addedAt: number }[]> {
    let docs: { id: string; addedAt: number }[] = [];
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "favoritePacks"));
        docs = snapshot.docs.map((d) => ({ id: d.id, addedAt: timestampToMillis(d.data({ serverTimestamps: "estimate" }).createdAt) }));
    } catch {
        return [];
    }
    const packs = await Promise.all(docs.map((d) => getStickerPackById(d.id)));
    return docs.flatMap((d, i) => (packs[i] ? [{ pack: packs[i]!, addedAt: d.addedAt }] : []));
}

// getFavoritePackIds→getStickerPackByIdの並列取得。stickerPacks.tsの
// getOwnedStickerPacksと同じパターン（循環import回避のためこちらに置く）。
export async function getFavoritedStickerPacks(uid: string): Promise<StickerPack[]> {
    const ids = await getFavoritePackIds(uid);
    const packs = await Promise.all(ids.map((id) => getStickerPackById(id)));
    return packs.filter((p): p is StickerPack => p !== null);
}
