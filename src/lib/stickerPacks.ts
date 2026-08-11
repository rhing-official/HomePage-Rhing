import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Sticker {
    stickerId: string;
    name: string;
    imageUrl: string;
}

export interface StickerPack {
    id: string;
    creatorId: string;
    name: string;
    price: number;
    stickers: Sticker[];
    category: string;
    tags: string[];
    salesCount: number;
}

function toStickerPack(id: string, data: DocumentData): StickerPack {
    return {
        id,
        creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
        name: typeof data.name === "string" ? data.name : "無題のパック",
        price: typeof data.price === "number" ? data.price : 0,
        stickers: Array.isArray(data.stickers) ? data.stickers : [],
        category: typeof data.category === "string" ? data.category : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        salesCount: typeof data.salesCount === "number" ? data.salesCount : 0,
    };
}

// stickerPacksはFirestoreルールで公開読み取り可（DaiDai репо firestore.rules参照）。
// Firebase未設定・ネットワーク不通時でもページがクラッシュしないよう、
// 呼び出し側の一覧・詳細ページの描画には失敗しても空配列/nullを返す。

export async function getAllStickerPacks(): Promise<StickerPack[]> {
    try {
        const snapshot = await getDocs(
            query(collection(db, "stickerPacks"), orderBy("createdAt", "desc")),
        );
        return snapshot.docs.map((d) => toStickerPack(d.id, d.data()));
    } catch {
        return [];
    }
}

export async function getTrendingStickerPacks(count: number): Promise<StickerPack[]> {
    try {
        const snapshot = await getDocs(
            query(collection(db, "stickerPacks"), orderBy("salesCount", "desc"), limit(count)),
        );
        return snapshot.docs.map((d) => toStickerPack(d.id, d.data()));
    } catch {
        return [];
    }
}

export async function getStickerPackById(packId: string): Promise<StickerPack | null> {
    try {
        const snapshot = await getDoc(doc(db, "stickerPacks", packId));
        if (!snapshot.exists()) return null;
        return toStickerPack(snapshot.id, snapshot.data());
    } catch {
        return null;
    }
}

export function formatPackPrice(price: number): string {
    if (price === 0) return "無料";
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(price);
}
