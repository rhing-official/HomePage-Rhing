import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// users/{uid}/follows/{creatorId}はDaiDai репо firestore.rulesにより
// 本人のみ読み書き可能。ドキュメントが存在すること自体がフォロー中の印
// （集計値は持たない、2026-08-13追加）。

export async function isFollowing(uid: string, creatorId: string): Promise<boolean> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid, "follows", creatorId));
        return snapshot.exists();
    } catch {
        return false;
    }
}

export async function followCreator(uid: string, creatorId: string): Promise<void> {
    await setDoc(doc(db, "users", uid, "follows", creatorId), {
        createdAt: serverTimestamp(),
    });
}

export async function unfollowCreator(uid: string, creatorId: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "follows", creatorId));
}

export async function getFollowedCreatorIds(uid: string): Promise<string[]> {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "follows"));
        return snapshot.docs.map((d) => d.id);
    } catch {
        return [];
    }
}
