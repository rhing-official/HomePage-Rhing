"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from "@simplewebauthn/browser";
import { firebaseApp } from "@/lib/firebase";

// DaiDai репоのfunctions/src/index.ts参照。書き込みはFirestore/Storageの
// ルールで一律禁止されているため、パックの作成・編集・通報はこれらの
// callableを経由する（region: asia-northeast1、DaiDai側と揃える）。
const functions = getFunctions(firebaseApp, "asia-northeast1");

export interface StickerInput {
    stickerId: string;
    name: string;
    imageUrl: string;
    roles: string[];
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

export async function uninstallStickerPack(data: { packId: string }): Promise<void> {
    await httpsCallable(functions, "uninstallStickerPack")(data);
}

export async function deleteAccountImmediately(): Promise<void> {
    await httpsCallable(functions, "deleteAccountImmediately")();
}

export async function createCheckoutSession(data: {
    packId: string;
    origin: string;
}): Promise<{ url?: string; granted?: boolean }> {
    const result = await httpsCallable(functions, "createCheckoutSession")(data);
    return result.data as { url?: string; granted?: boolean };
}

// パスキー（WebAuthn）ログイン・新規作成・復旧。DaiDai本体の
// functions/src/index.ts・lib/repositories/auth_repository.dartと同じ
// callable・入出力形式（region: asia-northeast1、DaiDai側と揃える）。

export async function beginPasskeyRegistration(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialCreationOptionsJSON;
}> {
    const result = await httpsCallable(functions, "beginPasskeyRegistration")();
    return result.data as { challengeId: string; options: PublicKeyCredentialCreationOptionsJSON };
}

export async function finishPasskeyRegistration(data: {
    challengeId: string;
    attestationResponse: RegistrationResponseJSON;
}): Promise<{ customToken: string }> {
    const result = await httpsCallable(functions, "finishPasskeyRegistration")(data);
    return result.data as { customToken: string };
}

export async function beginPasskeyAuthentication(data: {
    rhingSeed: string;
}): Promise<{ challengeId: string; options: PublicKeyCredentialRequestOptionsJSON }> {
    const result = await httpsCallable(functions, "beginPasskeyAuthentication")(data);
    return result.data as { challengeId: string; options: PublicKeyCredentialRequestOptionsJSON };
}

export async function finishPasskeyAuthentication(data: {
    challengeId: string;
    assertionResponse: AuthenticationResponseJSON;
}): Promise<{ customToken: string }> {
    const result = await httpsCallable(functions, "finishPasskeyAuthentication")(data);
    return result.data as { customToken: string };
}

export async function beginPasskeyRecovery(data: {
    rhingSeed: string;
}): Promise<{ recoveryId: string; questions: string[] }> {
    const result = await httpsCallable(functions, "beginPasskeyRecovery")(data);
    return result.data as { recoveryId: string; questions: string[] };
}

export async function finishPasskeyRecovery(data: {
    recoveryId: string;
    answers: string[];
}): Promise<{ customToken: string }> {
    const result = await httpsCallable(functions, "finishPasskeyRecovery")(data);
    return result.data as { customToken: string };
}
