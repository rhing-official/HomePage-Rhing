"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { CreatorProfile } from "@/lib/creatorProfiles";
import { loadThemePackPreview, type PublicThemePack, type ThemePackPreviewData } from "@/lib/themePackReview";
import { Skeleton } from "@/components/Skeleton";
import DesignActions from "./DesignActions";

export const brightnessLabel: Record<string, string> = { light: "明るい外観", dark: "暗い外観", both: "明るい・暗い外観" };

// 意匠の、色と形の見本（背景・パネル・ボタン）。一覧のカードと、詳細の左側で使う
export function DesignSwatch({ data, className = "" }: { data: ThemePackPreviewData | null; className?: string }) {
    const scope = data?.pack.brightness === "dark" ? "dark" : "light";
    const c = data?.pack.colors[scope];
    const border = data ? Math.min(data.pack.shape.borderWidth, 3) : 0;
    const radius = data ? Math.min(data.pack.shape.radius, 16) : 0;
    const line = c?.line ?? "#444";
    return (
        <div
            aria-hidden
            className={`flex flex-col items-center justify-center gap-3 bg-cover bg-center ${className}`}
            style={{ backgroundColor: c?.background ?? "#f3f4f6", backgroundImage: data?.backgroundUrl ? `url(${data.backgroundUrl})` : undefined }}
        >
            {data && (
                <>
                    <span className="px-5 py-2 text-sm" style={{ backgroundColor: c?.panel ?? "#fff", color: c?.text ?? "#222", border: `${border}px solid ${line}`, borderRadius: radius }}>
                        Aa あ
                    </span>
                    <span className="px-6 py-2 text-sm font-bold" style={{ backgroundColor: c?.accent ?? "#888", color: c?.onAccent ?? "#fff", border: `${border}px solid ${line}`, borderRadius: radius }}>
                        ボタン
                    </span>
                </>
            )}
        </div>
    );
}

// 意匠のカード。ぺったんのカード（StickerPackCard）と同じ作りで、詳細ページへ移る
export default function DesignCard({ pack, creator, owned = false }: { pack: PublicThemePack; creator?: CreatorProfile | null; owned?: boolean }) {
    const [data, setData] = useState<ThemePackPreviewData | null>(null);

    // 色の見本は、一覧に出た時に読む（pack.jsonは小さい）
    useEffect(() => {
        let cancelled = false;
        loadThemePackPreview(pack.assetPath)
            .then((d) => {
                if (!cancelled) setData(d);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [pack.assetPath]);

    return (
        <div className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-300/15 transition-all duration-300 overflow-hidden rounded-2xl">
            <Link href={`/daidai-yokocho/designs/${pack.id}`} className="flex flex-col">
                <div className="relative overflow-hidden">
                    <DesignSwatch data={data} className="w-full aspect-[4/3] transition-transform duration-500 group-hover:scale-105" />
                    {owned && (
                        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-emerald-600 shadow-sm" aria-label="取得済み">
                            <Check className="w-3.5 h-3.5" aria-hidden />
                            取得済み
                        </span>
                    )}
                    <DesignActions packId={pack.id} creatorId={pack.creatorId} variant="card" />
                </div>
                <div className="px-6 pt-3 flex flex-col gap-1">
                    <span className="text-sm font-bold whitespace-nowrap text-emerald-600">無料</span>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{pack.name}</h2>
                </div>
            </Link>

            <div className="px-6 pt-2 pb-6 flex flex-col gap-3">
                {creator === undefined ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-5 h-5 -ml-0.5 rounded-full" />
                        <Skeleton className="h-3 w-16 rounded-full" />
                    </div>
                ) : creator ? (
                    <Link href={`/daidai-yokocho/creator/${creator.userId}`} className="group/creator flex items-center gap-2 min-w-0 w-fit">
                        {creator.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={creator.iconUrl} alt="" className="w-5 h-5 -ml-0.5 rounded-full object-cover shrink-0 border border-white/80" />
                        ) : (
                            <div className="w-5 h-5 -ml-0.5 rounded-full bg-gray-200 shrink-0" />
                        )}
                        <span className="text-xs text-gray-500 group-hover/creator:text-blue-600 transition-colors truncate">
                            {creator.nickname ?? (creator.rhingSeed && `@${creator.rhingSeed}`)}
                        </span>
                    </Link>
                ) : null}

                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-3 py-1 rounded-full uppercase tracking-wider">
                        {brightnessLabel[pack.brightness] ?? "意匠"}
                    </span>
                </div>
            </div>
        </div>
    );
}
