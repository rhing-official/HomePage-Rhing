"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { addToCart, cartCollection, removeFromCart, CART_MAX_ITEMS } from "@/lib/cart";
import { timestampToMillis } from "@/lib/mixedList";
import { addToDesignList, designListCollection, removeFromDesignList, DESIGN_CART_MAX_ITEMS } from "@/lib/designLists";

interface CartContextValue {
    user: User | null;
    authReady: boolean;
    // ログイン中のカートを、最初に読み込み終えたか
    cartReady: boolean;
    ids: ReadonlySet<string>;
    count: number;
    has: (packId: string) => boolean;
    add: (packId: string) => Promise<{ ok: boolean; reason?: "limit" | "error" }>;
    remove: (packId: string) => Promise<void>;
    // 意匠のカート（users/{uid}/cartDesigns）。ぺったんとは別に持つ
    designIds: ReadonlySet<string>;
    hasDesign: (packId: string) => boolean;
    addDesign: (packId: string) => Promise<{ ok: boolean; reason?: "limit" | "error" }>;
    removeDesign: (packId: string) => Promise<void>;
    // メニューのバッジ用。ぺったんと意匠の合計
    totalCount: number;
    // 意匠のカートを、最初に読み込み終えたか
    designCartReady: boolean;
    // お気に入りの件数（ぺったんと意匠の合計）。メニューのバッジ用。公開が終わった意匠など、一覧では隠れるものも数える
    favoriteCount: number;
    // 追加した時刻（ミリ秒）。1つの一覧に混ぜて、新しい順に並べる為
    addedAt: ReadonlyMap<string, number>;
    designAddedAt: ReadonlyMap<string, number>;
}

const EMPTY: ReadonlySet<string> = new Set();
const EMPTY_MAP: ReadonlyMap<string, number> = new Map();

const CartContext = createContext<CartContextValue>({
    user: null,
    authReady: false,
    cartReady: false,
    ids: EMPTY,
    count: 0,
    has: () => false,
    add: async () => ({ ok: false, reason: "error" }),
    remove: async () => {},
    designIds: EMPTY,
    hasDesign: () => false,
    addDesign: async () => ({ ok: false, reason: "error" }),
    removeDesign: async () => {},
    totalCount: 0,
    designCartReady: false,
    favoriteCount: 0,
    addedAt: EMPTY_MAP,
    designAddedAt: EMPTY_MAP,
});

// ログイン中のカート（users/{uid}/cartPacks）を1つのリスナーで共有する。
// カードごとにリスナーを張らず、全ページで同じ状態を見る。
export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [snapshotIds, setIds] = useState<ReadonlySet<string>>(EMPTY);
    // 未ログインのときは、前のユーザーのカートを見せない
    const ids = user ? snapshotIds : EMPTY;
    const [readyUid, setReadyUid] = useState<string | null>(null);
    const [snapshotDesignIds, setDesignIds] = useState<ReadonlySet<string>>(EMPTY);
    const designIds = user ? snapshotDesignIds : EMPTY;
    const [snapshotAddedAt, setAddedAt] = useState<ReadonlyMap<string, number>>(EMPTY_MAP);
    const [snapshotDesignAddedAt, setDesignAddedAt] = useState<ReadonlyMap<string, number>>(EMPTY_MAP);
    const addedAt = user ? snapshotAddedAt : EMPTY_MAP;
    const designAddedAt = user ? snapshotDesignAddedAt : EMPTY_MAP;
    const [readyDesignUid, setReadyDesignUid] = useState<string | null>(null);
    const [snapshotFavPetan, setFavPetan] = useState(0);
    const [snapshotFavDesign, setFavDesign] = useState(0);
    const favoriteCount = user ? snapshotFavPetan + snapshotFavDesign : 0;

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthReady(true);
    }), []);

    useEffect(() => {
        if (!user) return;
        return onSnapshot(
            cartCollection(user.uid),
            (snapshot) => {
                setIds(new Set(snapshot.docs.map((d) => d.id)));
                setAddedAt(new Map(snapshot.docs.map((d) => [d.id, timestampToMillis(d.data({ serverTimestamps: "estimate" }).createdAt)])));
                setReadyUid(user.uid);
            },
            () => {
                setIds(EMPTY);
                setReadyUid(user.uid);
            },
        );
    }, [user]);

    useEffect(() => {
        if (!user) return;
        return onSnapshot(
            designListCollection(user.uid, "cartDesigns"),
            (snapshot) => {
                setDesignIds(new Set(snapshot.docs.map((d) => d.id)));
                setDesignAddedAt(new Map(snapshot.docs.map((d) => [d.id, timestampToMillis(d.data({ serverTimestamps: "estimate" }).createdAt)])));
                setReadyDesignUid(user.uid);
            },
            () => {
                setDesignIds(EMPTY);
                setReadyDesignUid(user.uid);
            },
        );
    }, [user]);

    // お気に入りの件数だけを、リアルタイムに数える（ハートを押すたびに、メニューのバッジが変わる）
    useEffect(() => {
        if (!user) return;
        const offPetan = onSnapshot(collection(db, "users", user.uid, "favoritePacks"), (s) => setFavPetan(s.size), () => setFavPetan(0));
        const offDesign = onSnapshot(designListCollection(user.uid, "favoriteDesigns"), (s) => setFavDesign(s.size), () => setFavDesign(0));
        return () => {
            offPetan();
            offDesign();
        };
    }, [user]);

    const add = useCallback<CartContextValue["add"]>(
        async (packId) => {
            if (!user) return { ok: false, reason: "error" };
            if (ids.size >= CART_MAX_ITEMS) return { ok: false, reason: "limit" };
            try {
                await addToCart(user.uid, packId);
                return { ok: true };
            } catch {
                return { ok: false, reason: "error" };
            }
        },
        [user, ids],
    );

    const remove = useCallback<CartContextValue["remove"]>(
        async (packId) => {
            if (!user) return;
            try {
                await removeFromCart(user.uid, packId);
            } catch {
                // 外せなかったときは、そのままにする（監視で、実際の状態が反映される）
            }
        },
        [user],
    );

    const addDesign = useCallback<CartContextValue["addDesign"]>(
        async (packId) => {
            if (!user) return { ok: false, reason: "error" };
            if (designIds.size >= DESIGN_CART_MAX_ITEMS) return { ok: false, reason: "limit" };
            try {
                await addToDesignList(user.uid, "cartDesigns", packId);
                return { ok: true };
            } catch {
                return { ok: false, reason: "error" };
            }
        },
        [user, designIds],
    );

    const removeDesign = useCallback<CartContextValue["removeDesign"]>(
        async (packId) => {
            if (!user) return;
            try {
                await removeFromDesignList(user.uid, "cartDesigns", packId);
            } catch {
                // 外せなかったときは、そのままにする（監視で、実際の状態が反映される）
            }
        },
        [user],
    );

    const value = useMemo<CartContextValue>(
        () => ({
            user, authReady, cartReady: !!user && readyUid === user.uid, ids, count: ids.size, has: (id) => ids.has(id), add, remove,
            designIds, hasDesign: (id) => designIds.has(id), addDesign, removeDesign, totalCount: ids.size + designIds.size,
            designCartReady: !!user && readyDesignUid === user.uid, favoriteCount, addedAt, designAddedAt,
        }),
        [user, authReady, readyUid, ids, add, remove, designIds, addDesign, removeDesign, readyDesignUid, favoriteCount, addedAt, designAddedAt],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    return useContext(CartContext);
}
