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
    coverStickerId?: string;
}): Promise<{ packId: string }> {
    const result = await httpsCallable(functions, "createStickerPack")(data);
    return result.data as { packId: string };
}

export async function updateStickerPackMeta(data: {
    packId: string;
    name?: string;
    price?: number;
    coverStickerId?: string;
}): Promise<void> {
    await httpsCallable(functions, "updateStickerPackMeta")(data);
}

export async function addStickersToStickerPack(data: {
    packId: string;
    stickers: StickerInput[];
}): Promise<void> {
    await httpsCallable(functions, "addStickersToStickerPack")(data);
}

// 出品者が、利用者のいないパックから、ぺったん1枚を直接削除する（利用者がいるときは、requestStickerPackDeletionにstickerIdを付けて申請する）
export async function deleteStickerFromPack(data: { packId: string; stickerId: string }): Promise<void> {
    await httpsCallable(functions, "deleteStickerFromPack")(data);
}

// ぺったん1枚の画像を差し替える（運営の許可は不要。stickerIdは変わらない。旧画像のファイルは、過去のメッセージのために残る）
export async function replaceStickerImage(data: {
    packId: string;
    stickerId: string;
    imageUrl: string;
    name?: string;
    roles?: string[];
}): Promise<void> {
    await httpsCallable(functions, "replaceStickerImage")(data);
}

// 公開済みのぺったんの役割を、後から付け直す（運営の許可は不要）。渡したぺったんの役割だけを置き換える。空の配列で、役割なしに戻す
export async function updateStickerRoles(data: {
    packId: string;
    roles: { stickerId: string; roles: string[] }[];
}): Promise<void> {
    await httpsCallable(functions, "updateStickerRoles")(data);
}

// 販売ページの閲覧を1回数える（出品者にだけ見せる閲覧回数）。出品者本人の閲覧は、サーバー側で数えない
export async function recordStickerPackView(data: { packId: string }): Promise<void> {
    await httpsCallable(functions, "recordStickerPackView")(data);
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

// 利用者のいるパックの削除を、運営へ申請する（理由は必須・200文字まで）
export async function requestStickerPackDeletion(data: { packId: string; stickerId?: string; reason: string }): Promise<void> {
    await httpsCallable(functions, "requestStickerPackDeletion")(data);
}

// 削除の申請を承認し、削除する日時（ISO文字列、今から24時間以上先）を指定する（管理者のみ）。urgentなら、日時は不要で、すぐに削除される（緊急）。入手した人だけにお知らせが送られる
export async function approveStickerPackDeletion(data: { packId: string; stickerId?: string; deleteAt?: string; urgent?: boolean }): Promise<{ notified: number }> {
    const result = await httpsCallable<typeof data, { notified?: number }>(functions, "approveStickerPackDeletion")(data);
    return { notified: result.data?.notified ?? 0 };
}

// 削除の申請を却下する（管理者のみ）。理由は任意で、出品者に表示される
export async function rejectStickerPackDeletion(data: { packId: string; stickerId?: string; note?: string }): Promise<void> {
    await httpsCallable(functions, "rejectStickerPackDeletion")(data);
}

// 承認済みの削除の予定を取り消す（管理者のみ）
export async function cancelScheduledPackDeletion(data: { packId: string; stickerId?: string }): Promise<void> {
    await httpsCallable(functions, "cancelScheduledPackDeletion")(data);
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

// Rhing Seedを入力せずに、保存済みのパスキーから選んでログインする（discoverable credential方式）
export async function beginPasskeyAuthenticationDiscoverable(): Promise<{
    challengeId: string;
    options: PublicKeyCredentialRequestOptionsJSON;
}> {
    const result = await httpsCallable(functions, "beginPasskeyAuthenticationDiscoverable")();
    return result.data as { challengeId: string; options: PublicKeyCredentialRequestOptionsJSON };
}

export async function finishPasskeyAuthenticationDiscoverable(data: {
    challengeId: string;
    assertionResponse: AuthenticationResponseJSON;
}): Promise<{ customToken: string }> {
    const result = await httpsCallable(functions, "finishPasskeyAuthenticationDiscoverable")(data);
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

// 意匠パックの投稿を提出する。素材は、先にStorageの themePackSubmissions/{uid}/{submissionId}/ へ置いておく。
// サーバーが素材を再検査し、投稿数（1人5件）を確かめる。TODO: サーバー側は未実装（文書/素材パック_サーバー側の変更案.md の3）。
export async function submitThemePack(data: {
    submissionId: string;
    rightsAccepted: true;
}): Promise<{ submissionId: string; packId: string; version: number }> {
    const result = await httpsCallable(functions, "submitThemePack")(data);
    return result.data as { submissionId: string; packId: string; version: number };
}

// 意匠パックの審査（管理者のみ）。DaiDaiリポジトリのfunctions/src/themePackReview.ts。
// 結果は、出品者（配信停止は取得した人にも）へ、お知らせとして書かれる。
export async function approveThemePack(data: { submissionId: string }): Promise<{ changed: boolean }> {
    const result = await httpsCallable<typeof data, { changed?: boolean }>(functions, "approveThemePack")(data);
    return { changed: result.data?.changed !== false };
}

// 差し戻し。理由は必須（500文字以内）で、出品者のお知らせにだけ入る
export async function rejectThemePack(data: { submissionId: string; reason: string }): Promise<void> {
    await httpsCallable(functions, "rejectThemePack")(data);
}

// 配信停止（権利侵害など）。公開中のパックを停止し、出品者と取得した人へお知らせが届く。理由は出品者にだけ見える
export async function suspendThemePack(data: { packId: string; reason: string }): Promise<{ notifiedOwners: number }> {
    const result = await httpsCallable<typeof data, { notifiedOwners?: number }>(functions, "suspendThemePack")(data);
    return { notifiedOwners: result.data?.notifiedOwners ?? 0 };
}

// 意匠パックの取得（無料のみ）。DaiDaiリポジトリのfunctions/src/themePackOwnership.ts。
// 二重の呼び出しは、alreadyOwned: true を返す（ownerCountは重ならない）
export async function acquireThemePack(data: { packId: string }): Promise<{ packId: string; version: number; alreadyOwned: boolean }> {
    const result = await httpsCallable<typeof data, { packId: string; version: number; alreadyOwned: boolean }>(functions, "acquireThemePack")(data);
    return result.data;
}

// 取得した意匠パックを外す。取り下げ・配信停止の後でも、いつでも外せる
export async function uninstallThemePack(data: { packId: string }): Promise<void> {
    await httpsCallable(functions, "uninstallThemePack")(data);
}

// 自分の公開中の意匠パックを取り下げる。新しい取得だけが止まり、取得した人は使い続けられる
export async function withdrawThemePack(data: { packId: string }): Promise<void> {
    await httpsCallable(functions, "withdrawThemePack")(data);
}
