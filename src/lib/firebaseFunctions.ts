"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "@/lib/firebase";

// DaiDai репоのfunctions/src/index.ts参照。書き込みはFirestore/Storageの
// ルールで一律禁止されているため、パックの作成・編集・通報はこれらの
// callableを経由する（region: asia-northeast1、DaiDai側と揃える）。
const functions = getFunctions(firebaseApp, "asia-northeast1");

export interface StickerInput {
    stickerId: string;
    name: string;
    imageUrl: string;
}

export async function createStickerPack(data: {
    name: string;
    price: number;
    stickers: StickerInput[];
    category: string;
    tags: string[];
}): Promise<{ packId: string }> {
    const result = await httpsCallable(functions, "createStickerPack")(data);
    return result.data as { packId: string };
}

export async function updateStickerPackMeta(data: {
    packId: string;
    name: string;
    price: number;
}): Promise<void> {
    await httpsCallable(functions, "updateStickerPackMeta")(data);
}

export async function addStickersToStickerPack(data: {
    packId: string;
    stickers: StickerInput[];
}): Promise<void> {
    await httpsCallable(functions, "addStickersToStickerPack")(data);
}

export async function createStickerPackReport(data: {
    packId: string;
    reason: string;
}): Promise<void> {
    await httpsCallable(functions, "createStickerPackReport")(data);
}

export async function deleteStickerPack(data: { packId: string }): Promise<void> {
    await httpsCallable(functions, "deleteStickerPack")(data);
}

export async function createCheckoutSession(data: {
    packId: string;
    origin: string;
}): Promise<{ url?: string; granted?: boolean }> {
    const result = await httpsCallable(functions, "createCheckoutSession")(data);
    return result.data as { url?: string; granted?: boolean };
}
