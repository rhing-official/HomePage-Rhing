import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// メッセージ内容に応じたぺったん提案機能（DaiDaiアプリ本体側、
// lib/utils/sticker_suggestion.dart）向けの役割一覧。役割の実体は
// DaiDai本体のFirestore `stickerRoles`コレクション（stickerRoleId→
// {name, keywords}、functions/src/index.tsのSTICKER_ROLE_SEEDS参照）が
// 一次情報のため、ここではハードコードせずFirestoreから直接取得する
// （stickerPacks.tsのgetAllStickerPacks()と同じ公開読み取りパターン）。
export interface StickerRoleOption {
    roleId: string;
    name: string;
}

export async function getStickerRoles(): Promise<StickerRoleOption[]> {
    try {
        const snapshot = await getDocs(collection(db, "stickerRoles"));
        return snapshot.docs.map((d) => {
            const name = d.data().name;
            return { roleId: d.id, name: typeof name === "string" ? name : d.id };
        });
    } catch {
        return [];
    }
}
