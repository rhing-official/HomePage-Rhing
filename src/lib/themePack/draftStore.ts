import type { ThemePackDraft } from "./build";

// 作りかけの意匠を、このブラウザの中（IndexedDB）に1件だけ保存する。サーバーには送らない。
// 画像のバイト列も、そのまま構造化複製で保存できる。端末をまたいだ引き継ぎは出来ない。

const DB_NAME = "rhing-theme-pack-draft";
const STORE = "drafts";
const KEY = "current";

function open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await open();
    try {
        return await new Promise<T>((resolve, reject) => {
            const req = fn(db.transaction(STORE, mode).objectStore(STORE));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    } finally {
        db.close();
    }
}

export async function loadDraft(): Promise<ThemePackDraft | null> {
    if (typeof indexedDB === "undefined") return null;
    return ((await run("readonly", (s) => s.get(KEY))) as ThemePackDraft | undefined) ?? null;
}

export async function saveDraft(draft: ThemePackDraft): Promise<void> {
    if (typeof indexedDB === "undefined") return;
    await run("readwrite", (s) => s.put(draft, KEY));
}

export async function clearDraft(): Promise<void> {
    if (typeof indexedDB === "undefined") return;
    await run("readwrite", (s) => s.delete(KEY));
}
