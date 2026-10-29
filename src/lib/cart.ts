import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getStickerPackById, isPackOwnedByUser, type StickerPack } from "@/lib/stickerPacks";
import { acquireFreePacks, type BulkAcquireResult } from "@/lib/bulkAcquire";

// users/{uid}/cartPacks/{packId}はDaiDaiリポジトリのfirestore.rulesで本人のみ読み書き可能。
// ドキュメントが存在すること自体がカートに入っている印（favoritePacksと同型）。
// 価格・名前は保存せず、表示のたびにstickerPacksから取得する。
export const CART_MAX_ITEMS = 50;

export function cartCollection(uid: string) {
    return collection(db, "users", uid, "cartPacks");
}

export async function addToCart(uid: string, packId: string): Promise<void> {
    await setDoc(doc(db, "users", uid, "cartPacks", packId), { createdAt: serverTimestamp() });
}

export async function removeFromCart(uid: string, packId: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "cartPacks", packId));
}

export async function getCartPackIds(uid: string): Promise<string[]> {
    try {
        const snapshot = await getDocs(cartCollection(uid));
        return snapshot.docs.map((d) => d.id);
    } catch {
        return [];
    }
}

export async function getCartStickerPacks(uid: string): Promise<StickerPack[]> {
    const ids = await getCartPackIds(uid);
    const packs = await Promise.all(ids.map((id) => getStickerPackById(id)));
    return packs.filter((p): p is StickerPack => p !== null);
}

export interface AddManyResult {
    added: number;
    skippedOwned: number;
    skippedInCart: number;
    skippedOwnPack: number;
    skippedOverLimit: number;
}

// カートに追加できるパックを選ぶ（入手済み・自分の出品・カート済みを除き、上限まで）
export async function selectAddableToCart(
    packs: StickerPack[],
    uid: string,
    inCart: ReadonlySet<string>,
    isOwned: (uid: string, packId: string) => Promise<boolean> = isPackOwnedByUser,
): Promise<{ addable: StickerPack[]; summary: Omit<AddManyResult, "added"> }> {
    const summary = { skippedOwned: 0, skippedInCart: 0, skippedOwnPack: 0, skippedOverLimit: 0 };
    const candidates = packs.filter((p) => {
        if (p.creatorId === uid) {
            summary.skippedOwnPack++;
            return false;
        }
        if (inCart.has(p.id)) {
            summary.skippedInCart++;
            return false;
        }
        return true;
    });
    const owned = await Promise.all(candidates.map((p) => isOwned(uid, p.id)));
    const notOwned = candidates.filter((_, i) => {
        if (owned[i]) summary.skippedOwned++;
        return !owned[i];
    });
    const room = Math.max(0, CART_MAX_ITEMS - inCart.size);
    summary.skippedOverLimit = Math.max(0, notOwned.length - room);
    return { addable: notOwned.slice(0, room), summary };
}

export async function addManyToCart(
    packs: StickerPack[],
    uid: string,
    inCart: ReadonlySet<string>,
): Promise<AddManyResult> {
    const { addable, summary } = await selectAddableToCart(packs, uid, inCart);
    if (addable.length > 0) {
        const batch = writeBatch(db);
        for (const p of addable) {
            batch.set(doc(db, "users", uid, "cartPacks", p.id), { createdAt: serverTimestamp() });
        }
        await batch.commit();
    }
    return { added: addable.length, ...summary };
}

export interface CheckoutResult extends BulkAcquireResult {
    // 入手に成功してカートから外したパックのID
    removedFromCart: string[];
}

// カートの中身をまとめて入手する。今は無料パックのみ（有料は`paid`として件数だけ返し、カートに残す）。
// 有料パックの再開時は、ここに決済（Stripeの複数品目など）を足す。
export async function checkoutCart(
    packs: StickerPack[],
    uid: string,
    onProgress?: (done: number, total: number) => void,
    remove: (uid: string, packId: string) => Promise<void> = removeFromCart,
    acquire: typeof acquireFreePacks = acquireFreePacks,
): Promise<CheckoutResult> {
    const result = await acquire(packs, uid, onProgress);
    // 入手に成功したものだけをカートから外す。失敗・有料は残す（入手済みの掃除は、カートページの読み込み時）
    const toRemove = result.acquired;
    await Promise.all(toRemove.map((id) => remove(uid, id)));
    return { ...result, removedFromCart: toRemove };
}
