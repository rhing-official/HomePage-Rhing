"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CatalogKind } from "@/components/daidai-yokocho/KindSwitch";

// 横丁のトップの、ぺったん／意匠のどちらを開いているか。
// 詳細ページから戻った時に、切り替えが初期値（ぺったん）へ戻らないよう、ブラウザの中（sessionStorage）に残す。
// URLの?kind=は、切り替えの時にreplaceStateで書き換えるだけで、Next.jsのルーターには伝わらない。
// そのため、戻った時にサーバーから渡される初期値は、最初に開いた時のままで、当てにならない。
const STORAGE_KEY = "daidaiYokochoCatalogKind";

let current: CatalogKind | null = null;
const listeners = new Set<() => void>();

function isKind(v: unknown): v is CatalogKind {
    return v === "petan" || v === "design";
}

function read(): CatalogKind | null {
    if (current) return current;
    try {
        const v = sessionStorage.getItem(STORAGE_KEY);
        if (isKind(v)) current = v;
    } catch {
        // sessionStorageが使えない環境では、このタブを閉じるまで、メモリの中だけで覚える
    }
    return current;
}

function write(next: CatalogKind) {
    current = next;
    try {
        sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
        // 保存できなくても、メモリの中では覚えている
    }
    listeners.forEach((l) => l());
}

// 通知はしない（最初の描画の前に、値を決めるだけ）
function adopt(next: CatalogKind) {
    if (read() === next) return;
    current = next;
    try {
        sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
        // 保存できなくても、メモリの中では覚えている
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * explicitKind: URLで、はっきり指定されている時だけ渡す（?kind=design）。最初に開いた時に、これを優先する。
 * 指定が無ければ、前に開いていた側（無ければぺったん）。
 */
export function useCatalogKind(explicitKind?: CatalogKind): [CatalogKind, (next: CatalogKind) => void] {
    // URLの指定は、画面に付いた時（購読を始める時）に、1回だけ反映する。以後の切り替えを、上書きしない
    const subscribeWithExplicit = useCallback(
        (listener: () => void) => {
            if (explicitKind && read() !== explicitKind) {
                adopt(explicitKind);
                listener();
            }
            return subscribe(listener);
        },
        // 初期値は、最初の描画のものだけを使う
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const kind = useSyncExternalStore(
        subscribeWithExplicit,
        () => read() ?? "petan",
        () => explicitKind ?? "petan",
    );
    const set = useCallback((next: CatalogKind) => write(next), []);
    return [kind, set];
}
