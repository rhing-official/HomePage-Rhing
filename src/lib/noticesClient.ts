"use client";

import { collection, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NOTICES_PAGE_SIZE, parseNotice, type Notice } from "@/lib/notices";

// users/{uid}.noticesReadAt（最後にお知らせを見た時刻）。無ければnull
export async function fetchNoticesReadAt(uid: string): Promise<Date | null> {
    const snap = await getDoc(doc(db, "users", uid));
    const ts = snap.data()?.noticesReadAt as { toDate?: () => Date } | undefined;
    return ts && typeof ts.toDate === "function" ? ts.toDate() : null;
}

// 未読数。件数だけを数える読み取りで、全文は読まない
export async function fetchUnreadCount(uid: string): Promise<number> {
    const readAt = await fetchNoticesReadAt(uid);
    const col = collection(db, "users", uid, "notices");
    const q = readAt ? query(col, where("createdAt", ">", Timestamp.fromDate(readAt))) : query(col);
    const snap = await getCountFromServer(q);
    return snap.data().count;
}

// 新しい順に最新50件
export async function fetchNotices(uid: string): Promise<Notice[]> {
    const q = query(collection(db, "users", uid, "notices"), orderBy("createdAt", "desc"), limit(NOTICES_PAGE_SIZE));
    const snap = await getDocs(q);
    return snap.docs.flatMap((d) => {
        const n = parseNotice(d.id, d.data());
        return n ? [n] : [];
    });
}

// 既読にする。本人は自分のusers/{uid}を更新できるため（既存のルール）、画面から直接書く
export async function markNoticesRead(uid: string): Promise<void> {
    await updateDoc(doc(db, "users", uid), { noticesReadAt: serverTimestamp() });
}
