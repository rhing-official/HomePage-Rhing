"use client";

import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getBytes, getDownloadURL, getStorage, ref } from "firebase/storage";
import { db, firebaseApp } from "@/lib/firebase";
import { checkContrast, type ContrastReport } from "@/lib/themePack/contrast";
import { parseThemePack, type ParsedThemePack } from "@/lib/themePack/spec";

// 意匠の審査（管理者）。themePackSubmissionsは、管理者と投稿者本人だけが読める。

const storage = getStorage(firebaseApp);

export type ThemePackSubmissionStatus =
    | "submitted"
    | "inReview"
    | "approved"
    | "rejected"
    | "withdrawn"
    | "suspended"
    | string;

export interface ThemePackSubmission {
    id: string;
    packId: string;
    creatorId: string;
    version: number;
    status: ThemePackSubmissionStatus;
    assetPath: string;
    /** 補強前の古い投稿には無い */
    name: string | null;
    decisionNote: string | null;
    createdAt: Date | null;
}

const STATUS_LABELS: Record<string, string> = {
    submitted: "審査待ち",
    inReview: "審査中",
    approved: "公開中",
    rejected: "差し戻し",
    withdrawn: "取り下げ",
    suspended: "配信停止",
};

export function submissionStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
}

/** 審査できる状態（承認・差し戻しの対象） */
export function isReviewable(status: string): boolean {
    return status === "submitted" || status === "inReview";
}

export async function listThemePackSubmissions(): Promise<ThemePackSubmission[]> {
    const snap = await getDocs(query(collection(db, "themePackSubmissions"), orderBy("createdAt", "desc"), limit(200)));
    return snap.docs.map((d) => {
        const data = d.data();
        const created = data.createdAt as { toDate?: () => Date } | undefined;
        return {
            id: d.id,
            packId: String(data.packId ?? ""),
            creatorId: String(data.creatorId ?? ""),
            version: Number(data.version ?? 0),
            status: String(data.status ?? ""),
            assetPath: String(data.assetPath ?? ""),
            name: typeof data.name === "string" ? data.name : null,
            decisionNote: typeof data.decisionNote === "string" ? data.decisionNote : null,
            createdAt: created && typeof created.toDate === "function" ? created.toDate() : null,
        };
    });
}

export interface ThemePackPreviewData {
    pack: ParsedThemePack;
    contrast: ContrastReport;
    /** 背景画像の表示用URL（画像だけに使う） */
    backgroundUrl: string | null;
    warnings: string[];
}

/** 投稿の素材（pack.jsonと背景画像）を、保存先から読んで、プレビュー用に整える */
export async function loadThemePackPreview(assetPath: string): Promise<ThemePackPreviewData> {
    const bytes = await getBytes(ref(storage, `${assetPath}/pack.json`), 64 * 1024);
    const parsed = parseThemePack(new TextDecoder("utf-8").decode(bytes));
    if (!parsed.ok) throw new Error(`pack.jsonを読めません。${parsed.error}`);
    const pack = parsed.pack;

    let backgroundUrl: string | null = null;
    if (pack.backgroundImage) {
        // ファイル名は、検査で、英数字・_・-と拡張子だけに限られている（..や/は入らない）。画像が無い時は、背景なしで出す
        backgroundUrl = await getDownloadURL(ref(storage, `${assetPath}/${pack.backgroundImage}`)).catch(() => null);
    }
    return { pack, contrast: checkContrast(pack), backgroundUrl, warnings: parsed.warnings };
}

// 公開中の意匠（themePacks。誰でも読める）。承認された版だけが入る
export interface PublicThemePack {
    id: string;
    /** approved（公開中）・withdrawn（取り下げ）・suspended（配信停止）。一覧に出るのはapprovedだけ */
    status?: string;
    name: string;
    creatorId: string;
    version: number;
    brightness: string;
    assetPath: string;
    approvedAt: Date | null;
    /** 取得した人の数（公開用の文書が持つ） */
    ownerCount?: number;
}

export async function listPublicThemePacks(): Promise<PublicThemePack[]> {
    const snap = await getDocs(query(collection(db, "themePacks"), where("status", "==", "approved"), limit(200)));
    const list = snap.docs.map((d) => {
        const data = d.data();
        const at = data.approvedAt as { toDate?: () => Date } | undefined;
        return {
            id: d.id,
            name: String(data.name ?? ""),
            creatorId: String(data.creatorId ?? ""),
            version: Number(data.version ?? 0),
            brightness: String(data.brightness ?? "both"),
            assetPath: String(data.assetPath ?? ""),
            approvedAt: at && typeof at.toDate === "function" ? at.toDate() : null,
        };
    });
    // 新しく公開された順（並べ替えはこちらで行い、複合インデックスを増やさない）
    return list.filter((p) => p.name && p.assetPath).sort((a, b) => (b.approvedAt?.getTime() ?? 0) - (a.approvedAt?.getTime() ?? 0));
}

// 公開中の意匠1件（承認されたものだけ）。無い・停止中・承認前はnull
export async function getPublicThemePack(id: string): Promise<PublicThemePack | null> {
    const snap = await getDoc(doc(db, "themePacks", id));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.status !== "approved") return null;
    const at = data.approvedAt as { toDate?: () => Date } | undefined;
    return {
        id: snap.id,
        name: String(data.name ?? ""),
        creatorId: String(data.creatorId ?? ""),
        version: Number(data.version ?? 0),
        brightness: String(data.brightness ?? "both"),
        assetPath: String(data.assetPath ?? ""),
        approvedAt: at && typeof at.toDate === "function" ? at.toDate() : null,
    };
}

// 意匠1件を、状態に関わらず読む（取得した人が、取り下げ・停止の後も見られるように）。無ければnull
export async function getThemePack(id: string): Promise<PublicThemePack | null> {
    const snap = await getDoc(doc(db, "themePacks", id));
    if (!snap.exists()) return null;
    const data = snap.data();
    const at = data.approvedAt as { toDate?: () => Date } | undefined;
    return {
        id: snap.id,
        status: String(data.status ?? ""),
        name: String(data.name ?? ""),
        creatorId: String(data.creatorId ?? ""),
        version: Number(data.version ?? 0),
        brightness: String(data.brightness ?? "both"),
        assetPath: String(data.assetPath ?? ""),
        approvedAt: at && typeof at.toDate === "function" ? at.toDate() : null,
        ownerCount: typeof data.ownerCount === "number" ? data.ownerCount : undefined,
    };
}

// 取得済みの意匠のid（users/{uid}/ownedThemePacks）。本人だけが読める
export async function listOwnedThemePackIds(uid: string): Promise<string[]> {
    const snap = await getDocs(collection(db, "users", uid, "ownedThemePacks"));
    return snap.docs.map((d) => d.id);
}

// 取得済みの意匠の一覧（取り下げ・停止になったものも含む）
export async function listOwnedThemePacks(uid: string): Promise<PublicThemePack[]> {
    const ids = await listOwnedThemePackIds(uid);
    const packs = await Promise.all(ids.map((id) => getThemePack(id).catch(() => null)));
    return packs.filter((p): p is PublicThemePack => p !== null);
}

// 自分の投稿の一覧（審査待ち・差し戻し・公開中・取り下げなど）。creatorIdで絞るクエリは、本人だけに許されている
export async function listMyThemePackSubmissions(uid: string): Promise<ThemePackSubmission[]> {
    const snap = await getDocs(query(collection(db, "themePackSubmissions"), where("creatorId", "==", uid), limit(100)));
    const list = snap.docs.map((d) => {
        const data = d.data();
        const created = data.createdAt as { toDate?: () => Date } | undefined;
        return {
            id: d.id,
            packId: String(data.packId ?? ""),
            creatorId: String(data.creatorId ?? ""),
            version: Number(data.version ?? 0),
            status: String(data.status ?? ""),
            assetPath: String(data.assetPath ?? ""),
            name: typeof data.name === "string" ? data.name : null,
            decisionNote: typeof data.decisionNote === "string" ? data.decisionNote : null,
            createdAt: created && typeof created.toDate === "function" ? created.toDate() : null,
        };
    });
    // 新しい順（並べ替えはこちらで行い、複合インデックスを増やさない）
    return list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export async function isThemePackOwned(uid: string, packId: string): Promise<boolean> {
    const snap = await getDoc(doc(db, "users", uid, "ownedThemePacks", packId));
    return snap.exists();
}

// あるクリエイターの、公開中の意匠（クリエイターのページ用）。新しく公開された順
export async function listPublicThemePacksByCreator(creatorId: string): Promise<PublicThemePack[]> {
    const snap = await getDocs(query(collection(db, "themePacks"), where("creatorId", "==", creatorId), where("status", "==", "approved"), limit(100)));
    const list = snap.docs.map((d) => {
        const data = d.data();
        const at = data.approvedAt as { toDate?: () => Date } | undefined;
        return {
            id: d.id,
            name: String(data.name ?? ""),
            creatorId: String(data.creatorId ?? ""),
            version: Number(data.version ?? 0),
            brightness: String(data.brightness ?? "both"),
            assetPath: String(data.assetPath ?? ""),
            approvedAt: at && typeof at.toDate === "function" ? at.toDate() : null,
        };
    });
    return list.filter((p) => p.name && p.assetPath).sort((a, b) => (b.approvedAt?.getTime() ?? 0) - (a.approvedAt?.getTime() ?? 0));
}
