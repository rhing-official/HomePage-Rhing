"use client";

import { useEffect, useMemo, useState } from "react";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import { auth, onAuthStateChanged } from "@/lib/firebaseAuth";
import { listOwnedThemePackIds, listPublicThemePacks, type PublicThemePack } from "@/lib/themePackReview";
import DesignCard from "./DesignCard";
import { applyDesignFilters, type DesignFilters } from "@/lib/designFilter";

export default function DesignCatalog({ query, filters, onCount, onShown }: { query: string; filters: DesignFilters; onCount?: (count: number | null) => void; onShown?: (packs: PublicThemePack[]) => void }) {
    const [packs, setPacks] = useState<PublicThemePack[] | null>(null);
    const [creators, setCreators] = useState<Map<string, CreatorProfile>>(new Map());
    const [failed, setFailed] = useState(false);
    // 取得済みのid（ログイン中だけ。カードに「取得済み」を出す）
    const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;
        const off = onAuthStateChanged(auth, (u) => {
            if (!u) {
                setOwnedIds(new Set());
                return;
            }
            listOwnedThemePackIds(u.uid)
                .then((ids) => !cancelled && setOwnedIds(new Set(ids)))
                .catch(() => {});
        });
        return () => {
            cancelled = true;
            off();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        listPublicThemePacks()
            .then(async (list) => {
                const profiles = await getCreatorProfiles(Array.from(new Set(list.map((p) => p.creatorId)))).catch(() => new Map<string, CreatorProfile>());
                if (cancelled) return;
                setCreators(profiles);
                setPacks(list);
            })
            .catch((err) => {
                console.error("意匠を読み込めませんでした:", err);
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const shown = useMemo(() => (packs ? applyDesignFilters(packs, query, filters, creators) : []), [packs, creators, query, filters]);

    // 件数は、検索の入力がある時だけ、呼び出し側の1行に出す
    useEffect(() => {
        onCount?.(packs === null ? null : shown.length);
    }, [packs, shown.length, onCount]);

    // 表示中の意匠は、呼び出し側の「全てカートに追加」が使う
    useEffect(() => {
        onShown?.(shown);
    }, [shown, onShown]);

    return (
        <div>
            {failed ? (
                <p className="text-center text-sm text-red-600">意匠を読み込めませんでした。時間をおいて、もう一度お試しください。</p>
            ) : packs === null ? (
                <p className="text-center text-sm text-gray-400">読み込み中…</p>
            ) : shown.length === 0 ? (
                <p className="text-center text-gray-500">{packs.length === 0 ? "公開されている意匠は有りません" : "条件に一致する意匠が見つかりませんでした"}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shown.map((p) => (
                        <DesignCard key={p.id} pack={p} creator={creators.get(p.creatorId) ?? null} owned={ownedIds.has(p.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
