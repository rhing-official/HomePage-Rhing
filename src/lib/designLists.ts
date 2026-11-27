import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getThemePack, isThemePackOwned, type PublicThemePack } from "@/lib/themePackReview";
import { timestampToMillis } from "@/lib/mixedList";

// 意匠のお気に入りとカート。ぺったんの favorites.ts・cart.ts と同じ作りで、保存先だけを分ける。
// users/{uid}/favoriteDesigns/{packId}と users/{uid}/cartDesigns/{packId}は、
// DaiDaiリポジトリのfirestore.rulesで本人のみ読み書き可能にする（文書/意匠のお気に入りとカート_DaiDai側の依頼.md）。
// ドキュメントが存在すること自体が印で、名前などは保存せず、表示のたびにthemePacksから取得する。

export const DESIGN_CART_MAX_ITEMS = 50;

export type DesignListName = "favoriteDesigns" | "cartDesigns";

export function designListCollection(uid: string, list: DesignListName) {
    return collection(db, "users", uid, list);
}

export async function addToDesignList(uid: string, list: DesignListName, packId: string): Promise<void> {
    await setDoc(doc(db, "users", uid, list, packId), { createdAt: serverTimestamp() });
}

export async function removeFromDesignList(uid: string, list: DesignListName, packId: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, list, packId));
}

export async function isInDesignList(uid: string, list: DesignListName, packId: string): Promise<boolean> {
    try {
        return (await getDoc(doc(db, "users", uid, list, packId))).exists();
    } catch {
        return false;
    }
}

export async function getDesignListIds(uid: string, list: DesignListName): Promise<string[]> {
    try {
        const snapshot = await getDocs(designListCollection(uid, list));
        return snapshot.docs.map((d) => d.id);
    } catch {
        return [];
    }
}

// idと、追加した時刻（ミリ秒。無ければ0）。並べ替えに使う
export async function getDesignListEntries(uid: string, list: DesignListName): Promise<{ id: string; addedAt: number }[]> {
    try {
        const snapshot = await getDocs(designListCollection(uid, list));
        return snapshot.docs.map((d) => ({ id: d.id, addedAt: timestampToMillis(d.data({ serverTimestamps: "estimate" }).createdAt) }));
    } catch {
        return [];
    }
}

// 読み込んだ意匠の扱い。
// ok: 公開中なので表示する / gone: 存在しない・取り下げなので、リストから消す /
// hidden: 配信停止（復活する可能性が有る）や審査前なので、消さずに隠す / error: 読めなかったので、何もしない
export type DesignListEntry =
    | { state: "ok"; pack: PublicThemePack }
    | { state: "gone" }
    | { state: "hidden" }
    | { state: "error" };

export function classifyThemePack(pack: PublicThemePack | null | undefined, failed = false): DesignListEntry {
    if (failed) return { state: "error" };
    if (!pack) return { state: "gone" };
    if (pack.status === "approved") return { state: "ok", pack };
    if (pack.status === "withdrawn") return { state: "gone" };
    return { state: "hidden" };
}

async function loadEntry(id: string): Promise<DesignListEntry> {
    try {
        return classifyThemePack(await getThemePack(id));
    } catch {
        return classifyThemePack(null, true);
    }
}

// リストの意匠を読み、公開中のものだけを返す。存在しない・取り下げのものは、リストからも消す。
// 取得済み（owned）のものも、カートだけは消す（お気に入りは、取得済みでも残す）
export async function loadDesignList(
    uid: string,
    list: DesignListName,
    ids: string[],
    isOwned: (uid: string, packId: string) => Promise<boolean> = isThemePackOwned,
): Promise<PublicThemePack[]> {
    const entries = await Promise.all(ids.map(loadEntry));
    const alive: PublicThemePack[] = [];
    for (const [i, entry] of entries.entries()) {
        if (entry.state === "gone") {
            await removeFromDesignList(uid, list, ids[i]).catch(() => {});
        } else if (entry.state === "ok") {
            if (list === "cartDesigns" && (await isOwned(uid, ids[i]).catch(() => false))) {
                await removeFromDesignList(uid, list, ids[i]).catch(() => {});
            } else {
                alive.push(entry.pack);
            }
        }
    }
    return alive;
}

// カートの意匠をまとめて取得する。1つずつ順に呼び（Cloud Functionsへの同時リクエストを避ける）、
// 成功したものだけをカートから外す。失敗したものはカートに残す。有料の意匠は無いので、決済の分岐は無い
export interface DesignCheckoutResult {
    acquired: string[];
    alreadyOwned: number;
    failed: number;
}

export async function checkoutDesignCart(
    uid: string,
    packIds: string[],
    acquire: (packId: string) => Promise<{ alreadyOwned: boolean }>,
    onProgress?: (done: number, total: number) => void,
): Promise<DesignCheckoutResult> {
    const result: DesignCheckoutResult = { acquired: [], alreadyOwned: 0, failed: 0 };
    for (const [i, id] of packIds.entries()) {
        onProgress?.(i, packIds.length);
        try {
            const res = await acquire(id);
            if (res.alreadyOwned) result.alreadyOwned++;
            else result.acquired.push(id);
            await removeFromDesignList(uid, "cartDesigns", id).catch(() => {});
        } catch {
            result.failed++;
        }
    }
    onProgress?.(packIds.length, packIds.length);
    return result;
}

// カートに入れられる意匠を選ぶ（取得済み・カート済みを除き、上限まで）。自分の投稿も入れられる
export async function selectAddableDesigns(
    packs: PublicThemePack[],
    uid: string,
    inCart: ReadonlySet<string>,
    isOwned: (uid: string, packId: string) => Promise<boolean> = isThemePackOwned,
): Promise<{ addable: PublicThemePack[]; skippedOwned: number; skippedInCart: number; skippedOverLimit: number }> {
    const summary = { skippedOwned: 0, skippedInCart: 0, skippedOverLimit: 0 };
    const candidates = packs.filter((p) => {
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
    const room = Math.max(0, DESIGN_CART_MAX_ITEMS - inCart.size);
    summary.skippedOverLimit = Math.max(0, notOwned.length - room);
    return { addable: notOwned.slice(0, room), ...summary };
}

export interface AddManyDesignsResult {
    added: number;
    skippedOwned: number;
    skippedInCart: number;
    skippedOverLimit: number;
}

// 表示中の意匠を、まとめてカートに追加する。追加できるものだけを、1回の書き込みで入れる
export async function addManyDesignsToCart(
    packs: PublicThemePack[],
    uid: string,
    inCart: ReadonlySet<string>,
): Promise<AddManyDesignsResult> {
    const { addable, ...summary } = await selectAddableDesigns(packs, uid, inCart);
    if (addable.length > 0) {
        const batch = writeBatch(db);
        for (const p of addable) {
            batch.set(doc(db, "users", uid, "cartDesigns", p.id), { createdAt: serverTimestamp() });
        }
        await batch.commit();
    }
    return { added: addable.length, ...summary };
}
