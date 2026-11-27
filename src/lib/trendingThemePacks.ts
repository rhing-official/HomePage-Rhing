import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PublicThemePack } from "@/lib/themePackReview";

// サーバー（トップページ）から呼ぶ為の、"use client"を持たない場所。
// themePackReview.ts は、ブラウザ専用（Storage等）の為、サーバーからは関数を呼べない。型の読み込みだけは、問題無い。

// 取得した人が多い、公開中の意匠（トップの「人気」用）。ownerCountの降順。
// 状態の絞り込みを同じクエリに入れると、複合インデックスが要るので、多めに読んでから、公開中だけを残す
export async function getTrendingThemePacks(count: number): Promise<PublicThemePack[]> {
    try {
        const snap = await getDocs(query(collection(db, "themePacks"), orderBy("ownerCount", "desc"), limit(Math.max(count * 4, 10))));
        const list: PublicThemePack[] = [];
        for (const d of snap.docs) {
            const data = d.data();
            if (data.status !== "approved") continue;
            const name = String(data.name ?? "");
            const assetPath = String(data.assetPath ?? "");
            if (!name || !assetPath) continue;
            const at = data.approvedAt as { toDate?: () => Date } | undefined;
            list.push({
                id: d.id,
                status: "approved",
                name,
                creatorId: String(data.creatorId ?? ""),
                version: Number(data.version ?? 0),
                brightness: String(data.brightness ?? "both"),
                assetPath,
                approvedAt: at && typeof at.toDate === "function" ? at.toDate() : null,
                ownerCount: typeof data.ownerCount === "number" ? data.ownerCount : 0,
            });
            if (list.length >= count) break;
        }
        return list;
    } catch {
        return [];
    }
}
