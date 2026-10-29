import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    Timestamp,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteStickerPackAssetByUrl } from "@/lib/firebaseStorage";
import type { StickerInput } from "@/lib/firebaseFunctions";

// users/{uid}/packDrafts/{draftId}はDaiDaiリポジトリのfirestore.rulesで本人のみ読み書き可。
// パックの作成を途中で保存しておくためのもの（公開されるstickerPacksとは別の場所）。
export const DRAFT_MAX = 10;

export interface PackDraft {
    id: string;
    name: string;
    category: string;
    tags: string[];
    stickers: StickerInput[];
    coverStickerId: string | null;
    updatedAt: number | null;
}

export type PackDraftInput = Pick<PackDraft, "name" | "category" | "tags" | "stickers" | "coverStickerId">;

// 下書きとして保存できるか。名前か画像のどちらかがあればよい（公開と違い、4枚は要らない）
export function canSaveDraft(name: string, stickerCount: number): boolean {
    return name.trim() !== "" || stickerCount > 0;
}

// 保存前の下書きにあって、保存後に無くなった画像のURL（Storageから掃除する対象）
export function removedImageUrls(before: { imageUrl: string }[], after: { imageUrl: string }[]): string[] {
    const kept = new Set(after.map((s) => s.imageUrl));
    return before.map((s) => s.imageUrl).filter((url) => !kept.has(url));
}

function toPackDraft(id: string, data: DocumentData): PackDraft {
    return {
        id,
        name: typeof data.name === "string" ? data.name : "",
        category: typeof data.category === "string" ? data.category : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        stickers: Array.isArray(data.stickers)
            ? data.stickers.map((s: StickerInput) => ({ ...s, roles: Array.isArray(s.roles) ? s.roles : [] }))
            : [],
        coverStickerId: typeof data.coverStickerId === "string" && data.coverStickerId ? data.coverStickerId : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : null,
    };
}

export async function listPackDrafts(uid: string): Promise<PackDraft[]> {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "packDrafts"));
        return snapshot.docs
            .map((d) => toPackDraft(d.id, d.data()))
            .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    } catch {
        return [];
    }
}

export async function getPackDraft(uid: string, draftId: string): Promise<PackDraft | null> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid, "packDrafts", draftId));
        return snapshot.exists() ? toPackDraft(snapshot.id, snapshot.data()) : null;
    } catch {
        return null;
    }
}

// 下書きを保存する。draftIdがnullなら新規（IDを発行して返す）、あれば上書き
export async function savePackDraft(uid: string, draftId: string | null, data: PackDraftInput): Promise<string> {
    const ref = draftId ? doc(db, "users", uid, "packDrafts", draftId) : doc(collection(db, "users", uid, "packDrafts"));
    await setDoc(
        ref,
        {
            name: data.name,
            category: data.category,
            tags: data.tags,
            stickers: data.stickers,
            coverStickerId: data.coverStickerId ?? "",
            ...(draftId ? {} : { createdAt: serverTimestamp() }),
            updatedAt: serverTimestamp(),
        },
        { merge: true },
    );
    return ref.id;
}

// 下書きを削除する。deleteImagesがtrueなら、下書きの画像もStorageから消す
// （公開に使った画像は、パックが使うので、消さない＝false）
export async function deletePackDraft(uid: string, draft: Pick<PackDraft, "id" | "stickers">, deleteImages: boolean): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "packDrafts", draft.id));
    if (deleteImages) {
        await Promise.all(draft.stickers.map((s) => deleteStickerPackAssetByUrl(s.imageUrl)));
    }
}

// ---- 公開中のパックの編集内容の下書き（users/{uid}/packEditDrafts/{packId}、1パックにつき1つ） ----
// 変更点だけを持つ。公開版は、「公開する」を押すまで変わらない。

export interface PackEditDraft {
    packId: string;
    name: string;
    price: number;
    coverStickerId: string | null;
    // 追加する画像（アップロード済み。公開するまで、公開版には入らない）
    addedStickers: StickerInput[];
    updatedAt: number | null;
}

export type PackEditDraftInput = Pick<PackEditDraft, "name" | "price" | "coverStickerId" | "addedStickers">;

function toPackEditDraft(packId: string, data: DocumentData): PackEditDraft {
    return {
        packId,
        name: typeof data.name === "string" ? data.name : "",
        price: typeof data.price === "number" ? data.price : 0,
        coverStickerId: typeof data.coverStickerId === "string" && data.coverStickerId ? data.coverStickerId : null,
        addedStickers: Array.isArray(data.addedStickers)
            ? data.addedStickers.map((s: StickerInput) => ({ ...s, roles: Array.isArray(s.roles) ? s.roles : [] }))
            : [],
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : null,
    };
}

export async function getPackEditDraft(uid: string, packId: string): Promise<PackEditDraft | null> {
    try {
        const snapshot = await getDoc(doc(db, "users", uid, "packEditDrafts", packId));
        return snapshot.exists() ? toPackEditDraft(snapshot.id, snapshot.data()) : null;
    } catch {
        return null;
    }
}

// 編集用の下書きが、あるパックのID一覧（「作成と管理」の一覧のバッジ用）
export async function listPackEditDraftIds(uid: string): Promise<Set<string>> {
    try {
        const snapshot = await getDocs(collection(db, "users", uid, "packEditDrafts"));
        return new Set(snapshot.docs.map((d) => d.id));
    } catch {
        return new Set();
    }
}

export async function savePackEditDraft(uid: string, packId: string, data: PackEditDraftInput): Promise<void> {
    await setDoc(doc(db, "users", uid, "packEditDrafts", packId), {
        name: data.name,
        price: data.price,
        coverStickerId: data.coverStickerId ?? "",
        addedStickers: data.addedStickers,
        updatedAt: serverTimestamp(),
    });
}

// 編集用の下書きを削除する。deleteImagesがtrueなら、追加予定の画像もStorageから消す
// （公開して、画像が公開版に入ったときは、消さない＝false。パックの削除のときは、true）
export async function deletePackEditDraft(uid: string, packId: string, deleteImages: boolean): Promise<void> {
    const draft = deleteImages ? await getPackEditDraft(uid, packId) : null;
    await deleteDoc(doc(db, "users", uid, "packEditDrafts", packId));
    if (draft) {
        await Promise.all(draft.addedStickers.map((s) => deleteStickerPackAssetByUrl(s.imageUrl)));
    }
}

// 編集画面で選んだ「代表」を、保存・公開のときのstickerIdに直す。
// 既存のぺったんならそのID、追加予定の画像なら、アップロード後（inputs）の同じ位置のID
export type CoverChoice = { type: "existing"; id: string } | { type: "pending"; key: File | string };

export function resolveCoverStickerId(
    choice: CoverChoice,
    pending: { file?: File; uploaded?: { stickerId: string } }[],
    inputs: { stickerId: string }[],
): string | undefined {
    if (choice.type === "existing") return choice.id;
    const index = pending.findIndex((e) => (e.file ?? e.uploaded?.stickerId) === choice.key);
    return inputs[index]?.stickerId;
}
