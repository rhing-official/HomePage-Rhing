"use client";

import { useEffect, useMemo, useState } from "react";
import { getCreatorProfiles, type CreatorProfile } from "@/lib/creatorProfiles";
import {
    listPublicThemePacks,
    loadThemePackPreview,
    type PublicThemePack,
    type ThemePackPreviewData,
} from "@/lib/themePackReview";
import ThemePackPreview from "./ThemePackPreview";

const brightnessLabel: Record<string, string> = { light: "明るい外観", dark: "暗い外観", both: "明るい・暗い外観" };

function creatorLabel(profile: CreatorProfile | undefined): string {
    return profile?.nickname ?? (profile?.rhingSeed ? `@${profile.rhingSeed}` : "投稿者");
}

function DesignCard({ pack, creator }: { pack: PublicThemePack; creator: string }) {
    const [data, setData] = useState<ThemePackPreviewData | null>(null);
    const [open, setOpen] = useState(false);
    const [failed, setFailed] = useState(false);

    // 色の見本は、一覧に出た時に読む（pack.jsonは小さい）
    useEffect(() => {
        let cancelled = false;
        loadThemePackPreview(pack.assetPath)
            .then((d) => {
                if (!cancelled) setData(d);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [pack.assetPath]);

    const scope = data ? (data.pack.brightness === "dark" ? "dark" : "light") : "light";
    const colors = data?.pack.colors[scope];
    return (
        <li className="rounded-m3-xl bg-white/80 border border-white/70 shadow-sm p-5 flex flex-col gap-3 text-left">
            <div
                aria-hidden
                className="h-24 rounded-xl border border-gray-200 bg-cover bg-center flex items-center justify-center gap-2"
                style={{
                    backgroundColor: colors?.background ?? "#f3f4f6",
                    backgroundImage: data?.backgroundUrl ? `url(${data.backgroundUrl})` : undefined,
                }}
            >
                {data && (
                    <>
                        <span className="px-3 py-1 text-xs" style={{ backgroundColor: colors?.panel ?? "#fff", color: colors?.text ?? "#222", border: `${Math.min(data.pack.shape.borderWidth, 3)}px solid ${colors?.line ?? "#444"}`, borderRadius: Math.min(data.pack.shape.radius, 14) }}>
                            Aa あ
                        </span>
                        <span className="px-3 py-1 text-xs font-bold" style={{ backgroundColor: colors?.accent ?? "#888", color: colors?.onAccent ?? "#fff", border: `${Math.min(data.pack.shape.borderWidth, 3)}px solid ${colors?.line ?? "#444"}`, borderRadius: Math.min(data.pack.shape.radius, 14) }}>
                            ボタン
                        </span>
                    </>
                )}
            </div>
            <div>
                <p className="font-bold text-gray-900">{pack.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {creator}　{brightnessLabel[pack.brightness] ?? ""}　版{pack.version}
                </p>
            </div>
            {failed && <p className="text-xs text-gray-400">プレビューを読み込めませんでした。</p>}
            {data && (
                <>
                    <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-sm font-bold text-blue-600 hover:text-blue-800">
                        {open ? "閉じる" : "詳しく見る"}
                    </button>
                    {open && <ThemePackPreview data={data} />}
                </>
            )}
        </li>
    );
}

export default function DesignCatalog() {
    const [packs, setPacks] = useState<PublicThemePack[] | null>(null);
    const [creators, setCreators] = useState<Map<string, CreatorProfile>>(new Map());
    const [failed, setFailed] = useState(false);
    const [query, setQuery] = useState("");

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
                console.error("意匠パックを読み込めませんでした:", err);
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!packs) return [];
        if (!q) return packs;
        return packs.filter((p) => p.name.toLowerCase().includes(q) || creatorLabel(creators.get(p.creatorId)).toLowerCase().includes(q));
    }, [packs, creators, query]);

    return (
        <div>
            <div className="max-w-2xl mx-auto mb-10 flex flex-col gap-3">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="検索"
                    className="w-full px-5 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm shadow-blue-300/5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:bg-white/90 transition-all duration-300"
                />
                <p className="text-xs text-gray-500 text-center">意匠パックは、DaiDaiの色・形・背景を着せ替える、デザインの詰め合わせです。取得は、準備中です。</p>
            </div>
            {failed ? (
                <p className="text-center text-sm text-red-600">意匠パックを読み込めませんでした。時間をおいて、もう一度お試しください。</p>
            ) : packs === null ? (
                <p className="text-center text-sm text-gray-400">読み込み中…</p>
            ) : shown.length === 0 ? (
                <p className="text-center text-gray-500">{packs.length === 0 ? "公開されている意匠パックは有りません" : "条件に一致する意匠パックが見つかりませんでした"}</p>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shown.map((p) => (
                        <DesignCard key={p.id} pack={p} creator={creatorLabel(creators.get(p.creatorId))} />
                    ))}
                </ul>
            )}
        </div>
    );
}
