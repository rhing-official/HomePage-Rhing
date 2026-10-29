import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
    where,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Sticker {
    stickerId: string;
    name: string;
    imageUrl: string;
    // メッセージ内容に応じたぺったん提案機能向けの役割id（stickerRoles.tsの
    // getStickerRoles()が返すroleIdのいずれか）のリスト。未設定は空配列
    // （DaiDai本体側 lib/models/sticker.dart の Sticker.roles と同じ形）。
    roles: string[];
}

// v1のカテゴリ候補（固定リスト）。増減する場合はここを編集する。
export const STICKER_PACK_CATEGORIES = [
    "あいさつ",
    "感情・リアクション",
    "動物",
    "キャラクター",
    "日常",
    "ビジネス",
    "季節・イベント",
    "その他",
] as const;

export interface StickerPack {
    id: string;
    creatorId: string;
    name: string;
    price: number;
    stickers: Sticker[];
    // パックの「代表」にするぺったんのstickerId。未設定・不正なときは、先頭のぺったん（getPackCover参照）
    coverStickerId: string | null;
    category: string;
    tags: string[];
    salesCount: number;
    ownerCount: number;
    createdAt: number | null;
    updatedAt: number | null;
}

function toStickerPack(id: string, data: DocumentData): StickerPack {
    return {
        id,
        creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
        name: typeof data.name === "string" ? data.name : "無題のパック",
        price: typeof data.price === "number" ? data.price : 0,
        // rolesは後から追加した項目のため、古いパックのステッカーには無い。必ず配列にそろえる
        stickers: Array.isArray(data.stickers)
            ? data.stickers.map((s: Sticker) => ({ ...s, roles: Array.isArray(s.roles) ? s.roles : [] }))
            : [],
        coverStickerId: typeof data.coverStickerId === "string" ? data.coverStickerId : null,
        category: typeof data.category === "string" ? data.category : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        salesCount: typeof data.salesCount === "number" ? data.salesCount : 0,
        ownerCount: typeof data.ownerCount === "number" ? data.ownerCount : 0,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : null,
    };
}

// stickerPacksはFirestoreルールで公開読み取り可（DaiDai репо firestore.rules参照）。
// Firebase未設定・ネットワーク不通時でもページがクラッシュしないよう、
// 呼び出し側の一覧・販売ページの描画には失敗しても空配列/nullを返す。

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

export async function getStickerPacksByCreator(uid: string): Promise<StickerPack[]> {
    try {
        const snapshot = await getDocs(
            query(collection(db, "stickerPacks"), where("creatorId", "==", uid)),
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

// タグ入力の候補用に、既存パックで使われているタグを重複なく集める。
export async function getAllTags(): Promise<string[]> {
    const packs = await getAllStickerPacks();
    const tags = new Set<string>();
    for (const pack of packs) {
        for (const tag of pack.tags) tags.add(tag);
    }
    return Array.from(tags).sort();
}

// users/{uid}/ownedStickerPacks/{packId}はDaiDai репо firestore.rulesにより
// 本人のみ読み取り可能。ドキュメントが存在すること自体が所有の印。
export async function isPackOwnedByUser(uid: string, packId: string): Promise<boolean> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid, "ownedStickerPacks", packId));
        return snapshot.exists();
    } catch {
        return false;
    }
}

// users/{uid}/ownedStickerPacksのドキュメントID一覧を取得し、各パックの詳細を
// 並列取得する（管理画面「所持しているぺったん」用、2026-08-11追加）。
export async function getOwnedStickerPacks(uid: string): Promise<StickerPack[]> {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "ownedStickerPacks"));
        const packs = await Promise.all(snapshot.docs.map((d) => getStickerPackById(d.id)));
        return packs.filter((p): p is StickerPack => p !== null);
    } catch {
        return [];
    }
}

// パックの代表になるぺったん。coverStickerIdに一致するものがあればそれ、なければ先頭
export function getPackCover(pack: Pick<StickerPack, "stickers" | "coverStickerId">): Sticker | undefined {
    return pack.stickers.find((s) => s.stickerId === pack.coverStickerId) ?? pack.stickers[0];
}

export function formatPackPrice(price: number): string {
    if (price === 0) return "無料";
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(price);
}

// 年月日は「2026/08/13」のように、/で区切る
export function formatPackDate(ms: number): string {
    const d = new Date(ms);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}/${mm}/${dd}`;
}
