import {
    collection,
    doc,
    documentId,
    getDoc,
    getDocs,
    query,
    where,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CreatorProfile {
    userId: string;
    rhingId: string;
    nickname: string | null;
    iconUrl: string | null;
    statusMessage: string | null;
    snsLinkUrls: string[];
}

function toCreatorProfile(id: string, data: DocumentData): CreatorProfile {
    return {
        userId: id,
        rhingId: typeof data.rhingId === "string" ? data.rhingId : "",
        nickname: typeof data.nickname === "string" ? data.nickname : null,
        iconUrl: typeof data.iconUrl === "string" ? data.iconUrl : null,
        statusMessage: typeof data.statusMessage === "string" ? data.statusMessage : null,
        snsLinkUrls: Array.isArray(data.snsLinkUrls) ? data.snsLinkUrls : [],
    };
}

// creatorProfilesはFirestoreルールで公開読み取り可（DaiDai репо firestore.rules参照）。
// daidai横丁で一度でも出品したユーザーのみ存在する（stickerPacks.tsと同様、
// 失敗しても空配列/nullを返しページをクラッシュさせない）。

export async function getCreatorProfile(uid: string): Promise<CreatorProfile | null> {
    try {
        const snapshot = await getDoc(doc(db, "creatorProfiles", uid));
        if (!snapshot.exists()) return null;
        return toCreatorProfile(snapshot.id, snapshot.data());
    } catch {
        return null;
    }
}

function chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

// Firestoreの`in`クエリは30件までのため、重複除去した上でチャンク分割して
// 並列取得する（カタログページ等で複数パックのクリエイターをまとめて引く用）。
export async function getCreatorProfiles(uids: string[]): Promise<Map<string, CreatorProfile>> {
    const result = new Map<string, CreatorProfile>();
    const uniqueIds = Array.from(new Set(uids)).filter((id) => id.length > 0);
    if (uniqueIds.length === 0) return result;

    try {
        const chunks = chunk(uniqueIds, 30);
        const snapshots = await Promise.all(
            chunks.map((c) =>
                getDocs(query(collection(db, "creatorProfiles"), where(documentId(), "in", c))),
            ),
        );
        for (const snapshot of snapshots) {
            for (const d of snapshot.docs) {
                result.set(d.id, toCreatorProfile(d.id, d.data()));
            }
        }
    } catch {
        return result;
    }
    return result;
}
