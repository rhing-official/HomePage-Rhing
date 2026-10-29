import { isPackOwnedByUser, type StickerPack } from "@/lib/stickerPacks";
import { createCheckoutSession } from "@/lib/firebaseFunctions";

export const PACKS_OWNED_EVENT = "stickerPacksOwned";

export interface BulkAcquireResult {
    acquired: string[];
    alreadyOwned: number;
    failed: number;
    paid: number;
}

export interface BulkAcquireDeps {
    isOwned: (uid: string, packId: string) => Promise<boolean>;
    acquire: (packId: string) => Promise<{ granted?: boolean; url?: string }>;
}

const defaultDeps: BulkAcquireDeps = {
    isOwned: isPackOwnedByUser,
    acquire: (packId) => createCheckoutSession({ packId, origin: window.location.origin }),
};

function isAlreadyExists(err: unknown): boolean {
    return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "functions/already-exists";
}

// 未入手の無料パックを探す。有料は対象外（件数だけ返す）
export async function findAcquirableFreePacks(
    packs: StickerPack[],
    uid: string,
    isOwned: BulkAcquireDeps["isOwned"] = defaultDeps.isOwned,
): Promise<{ targets: StickerPack[]; alreadyOwned: number; paid: number }> {
    const free = packs.filter((p) => p.price === 0);
    const owned = await Promise.all(free.map((p) => isOwned(uid, p.id)));
    return {
        targets: free.filter((_, i) => !owned[i]),
        alreadyOwned: owned.filter(Boolean).length,
        paid: packs.length - free.length,
    };
}

// 無料パックを1つずつ順番に入手する（Cloud Functionsへの同時リクエストを避ける）
export async function acquireFreePacks(
    packs: StickerPack[],
    uid: string,
    onProgress?: (done: number, total: number) => void,
    deps: BulkAcquireDeps = defaultDeps,
): Promise<BulkAcquireResult> {
    const { targets, alreadyOwned, paid } = await findAcquirableFreePacks(packs, uid, deps.isOwned);
    const result: BulkAcquireResult = { acquired: [], alreadyOwned, failed: 0, paid };

    for (const [i, pack] of targets.entries()) {
        onProgress?.(i, targets.length);
        try {
            const res = await deps.acquire(pack.id);
            if (res.granted) result.acquired.push(pack.id);
            else result.failed++;
        } catch (err) {
            if (isAlreadyExists(err)) result.alreadyOwned++;
            else result.failed++;
        }
    }
    onProgress?.(targets.length, targets.length);

    // 入手済みになったカード・ボタンの表示を更新させる
    if (typeof window !== "undefined" && result.acquired.length > 0) {
        window.dispatchEvent(new CustomEvent(PACKS_OWNED_EVENT, { detail: { packIds: result.acquired } }));
    }
    return result;
}
