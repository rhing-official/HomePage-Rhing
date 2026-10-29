import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// packStats/{packId}はDaiDaiリポジトリのfirestore.rulesで、出品者本人だけが読める。
// 閲覧回数の記録は、Cloud Functions（recordStickerPackView）が行う。
// 読めない（出品者でない・未作成）ときは、未作成は0、権限エラー等はnullを返す。
export async function getPackViewCount(packId: string): Promise<number | null> {
    try {
        const snapshot = await getDoc(doc(db, "packStats", packId));
        const count = snapshot.exists() ? snapshot.data().viewCount : 0;
        return typeof count === "number" ? count : 0;
    } catch {
        return null;
    }
}

const VIEW_KEY_PREFIX = "packViewed:";

export interface ViewStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

// この訪問（ブラウザのタブ・セッション）で、まだ数えていないパックなら真。真を返したときは、数えた印を残す。
// 更新ボタンの連打で、閲覧数が増えないようにするためのもの。
export function shouldRecordView(storage: ViewStorage, packId: string): boolean {
    const key = VIEW_KEY_PREFIX + packId;
    try {
        if (storage.getItem(key)) return false;
        storage.setItem(key, "1");
        return true;
    } catch {
        // storageが使えないとき（プライベートモード等）は、数えない（増えすぎを避ける）
        return false;
    }
}
