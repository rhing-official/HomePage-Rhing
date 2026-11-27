"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCreatorProfile, type CreatorProfile } from "@/lib/creatorProfiles";
import {
    getThemePack,
    listPublicThemePacks,
    loadThemePackPreview,
    type PublicThemePack,
    type ThemePackPreviewData,
} from "@/lib/themePackReview";
import DesignCard, { brightnessLabel } from "@/components/daidai-yokocho/DesignCard";
import DesignAcquireButton from "@/components/daidai-yokocho/DesignAcquireButton";
import DesignActions from "@/components/daidai-yokocho/DesignActions";
import ThemePackPreview from "@/components/daidai-yokocho/ThemePackPreview";

type State = { kind: "loading" } | { kind: "missing" } | { kind: "error" } | { kind: "ready"; pack: PublicThemePack };

function formatDate(d: Date | null): string {
    return d ? d.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" }) : "";
}

// 意匠の詳細（ぺったんの詳細ページと同じ構成）。取得は、準備中のため、押せない
export default function DesignDetailClient({ packId }: { packId: string }) {
    const [state, setState] = useState<State>({ kind: "loading" });
    const [creator, setCreator] = useState<CreatorProfile | null | undefined>(undefined);
    const [data, setData] = useState<ThemePackPreviewData | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [others, setOthers] = useState<PublicThemePack[]>([]);

    useEffect(() => {
        let cancelled = false;
        getThemePack(packId)
            .then((pack) => {
                if (cancelled) return;
                setState(pack ? { kind: "ready", pack } : { kind: "missing" });
                if (!pack) return;
                getCreatorProfile(pack.creatorId)
                    .then((c) => !cancelled && setCreator(c))
                    .catch(() => !cancelled && setCreator(null));
                loadThemePackPreview(pack.assetPath)
                    .then((d) => !cancelled && setData(d))
                    .catch(() => !cancelled && setPreviewFailed(true));
                listPublicThemePacks()
                    .then((list) => !cancelled && setOthers(list.filter((p) => p.creatorId === pack.creatorId && p.id !== pack.id).slice(0, 3)))
                    .catch(() => {});
            })
            .catch((err) => {
                console.error("意匠を読み込めませんでした:", err);
                if (!cancelled) setState({ kind: "error" });
            });
        return () => {
            cancelled = true;
        };
    }, [packId]);

    if (state.kind === "loading") return <p className="text-center text-sm text-gray-400 pb-24">読み込み中…</p>;
    if (state.kind !== "ready") {
        return (
            <div className="container mx-auto px-6 max-w-3xl pb-24 text-center">
                <p className="text-gray-600">{state.kind === "missing" ? "意匠が見つかりません。公開が終わった可能性があります。" : "意匠を読み込めませんでした。時間をおいて、もう一度お試しください。"}</p>
                <Link href="/daidai-yokocho?kind=design" className="mt-6 inline-block text-sm font-bold text-blue-600 hover:text-blue-800">
                    意匠の一覧へ戻る
                </Link>
            </div>
        );
    }

    const { pack } = state;
    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
                    {/* 左: プレビュー */}
                    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                        {data ? (
                            <ThemePackPreview data={data} />
                        ) : previewFailed ? (
                            <p className="text-sm text-gray-400">プレビューを読み込めませんでした。</p>
                        ) : (
                            <p className="text-sm text-gray-400">読み込み中…</p>
                        )}
                    </div>

                    {/* 右: 商品情報と取得（PCでは追従） */}
                    <div className="md:sticky md:top-28 flex flex-col gap-6">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-gray-500 mb-2 block">意匠</span>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wider">{pack.name}</h1>
                            {creator && (
                                <Link href={`/daidai-yokocho/creator/${pack.creatorId}`} className="mt-4 flex items-center gap-2 w-fit group">
                                    {creator.iconUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={creator.iconUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/80" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-200" />
                                    )}
                                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">
                                        {creator.nickname ?? (creator.rhingSeed && `@${creator.rhingSeed}`)}
                                    </span>
                                </Link>
                            )}
                        </div>

                        <p className="text-4xl font-bold text-emerald-600">無料</p>

                        {pack.status === "withdrawn" && (
                            <p className="rounded-m3-md border border-gray-200 bg-gray-50 text-gray-600 px-4 py-3 text-sm">
                                この意匠は、取り下げられました。新しく取得することは出来ません。取得済みの方は、引き続き使えます。
                            </p>
                        )}
                        {pack.status === "suspended" && (
                            <p className="rounded-m3-md border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                この意匠は、配信を停止しました。取得済みの方の表示は、標準に戻ります。
                            </p>
                        )}

                        <div className="flex flex-col gap-4">
                            <DesignAcquireButton packId={pack.id} status={pack.status ?? ""} redirectPath={`/daidai-yokocho/designs/${pack.id}`} />
                            <DesignActions packId={pack.id} status={pack.status ?? ""} variant="detail" />
                        </div>

                        <ul className="text-xs text-gray-500 leading-relaxed list-disc pl-5 space-y-1">
                            <li>取得した意匠は、DaiDaiアプリの設定から選べるようになります。アプリでの対応は、準備中です。</li>
                            <li>取得した意匠は、「購入済み」の意匠の側から確認出来ます。</li>
                        </ul>

                        <dl className="text-sm border-t border-gray-200">
                            <div className="flex gap-4 py-3 border-b border-gray-100">
                                <dt className="w-24 shrink-0 text-gray-500">対応する外観</dt>
                                <dd className="text-gray-800">{brightnessLabel[pack.brightness] ?? ""}</dd>
                            </div>
                            <div className="flex gap-4 py-3 border-b border-gray-100">
                                <dt className="w-24 shrink-0 text-gray-500">版</dt>
                                <dd className="text-gray-800">{pack.version}</dd>
                            </div>
                            {pack.approvedAt && (
                                <div className="flex gap-4 py-3 border-b border-gray-100">
                                    <dt className="w-24 shrink-0 text-gray-500">公開日</dt>
                                    <dd className="text-gray-800">{formatDate(pack.approvedAt)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {others.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-lg font-bold text-gray-900 tracking-wider mb-6">このクリエイターの、他の意匠</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {others.map((p) => (
                                <DesignCard key={p.id} pack={p} creator={creator} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
