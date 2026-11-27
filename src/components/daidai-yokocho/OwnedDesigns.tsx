"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { uninstallThemePack } from "@/lib/firebaseFunctions";
import { listOwnedThemePacks, loadThemePackPreview, type PublicThemePack, type ThemePackPreviewData } from "@/lib/themePackReview";
import { brightnessLabel, DesignSwatch } from "./DesignCard";

const STATUS_NOTE: Record<string, { label: string; className: string }> = {
    withdrawn: { label: "取り下げ", className: "bg-gray-100 text-gray-600" },
    suspended: { label: "配信停止", className: "bg-red-100 text-red-700" },
};

function OwnedDesignRow({ pack, onRemoved }: { pack: PublicThemePack; onRemoved: () => void }) {
    const [data, setData] = useState<ThemePackPreviewData | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadThemePackPreview(pack.assetPath)
            .then((d) => !cancelled && setData(d))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [pack.assetPath]);

    const remove = async () => {
        setBusy(true);
        setError(null);
        try {
            await uninstallThemePack({ packId: pack.id });
            onRemoved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "取得を外せませんでした");
            setBusy(false);
        }
    };

    const note = pack.status ? STATUS_NOTE[pack.status] : undefined;
    // 見た目は、ぺったんの「購入済み」のカード（OwnedPackCard）に揃える
    return (
        <li className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Link href={`/daidai-yokocho/designs/${pack.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors truncate">
                        {pack.name}
                    </Link>
                    {note && <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${note.className}`}>{note.label}</span>}
                </div>
                <span className="shrink-0 text-xs text-gray-400">無料</span>
            </div>

            <DesignSwatch data={data} className="w-full h-28 rounded-lg border border-white/80 overflow-hidden" />
            <p className="text-xs text-gray-500">
                {brightnessLabel[pack.brightness] ?? ""}　版{pack.version}
            </p>
            {pack.status === "suspended" && <p className="text-xs text-red-600">配信が停止されたため、アプリの表示は標準に戻ります。</p>}

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                {confirming ? (
                    <div className="flex flex-col gap-3">
                        <span className="text-sm text-gray-700">本当にアンインストールしますか？この意匠への着せ替えが、標準に戻ります。</span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                disabled={busy}
                                className="text-sm px-5 py-1.5 rounded-full border border-primary/50 text-primary hover:bg-primary-container/60 transition disabled:opacity-50"
                            >
                                やめる
                            </button>
                            <button
                                type="button"
                                onClick={remove}
                                disabled={busy}
                                className="text-sm px-5 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {busy ? "アンインストール中..." : "アンインストール"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="self-start text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                        アンインストールする
                    </button>
                )}
                {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
            </div>
        </li>
    );
}

// 取得済みの意匠（「購入済み」の意匠の側）。取り下げ・停止のものも含め、いつでも外せる
export default function OwnedDesigns({ uid }: { uid: string }) {
    const [packs, setPacks] = useState<PublicThemePack[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listOwnedThemePacks(uid)
            .then((list) => !cancelled && setPacks(list))
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [uid]);

    if (failed) return <p className="text-sm text-red-600">取得済みの意匠を読み込めませんでした。</p>;
    if (packs === null) return <p className="text-sm text-gray-400">読み込み中…</p>;
    if (packs.length === 0) {
        return (
            <p className="text-gray-400 text-sm">
                まだ意匠を所持していません。
                <Link href="/daidai-yokocho?kind=design" className="text-blue-600 hover:underline ml-1">
                    daidai横丁で探す →
                </Link>
            </p>
        );
    }
    return (
        <ul className="flex flex-col gap-6">
            {packs.map((p) => (
                <OwnedDesignRow key={p.id} pack={p} onRemoved={() => setPacks((prev) => (prev ?? []).filter((x) => x.id !== p.id))} />
            ))}
        </ul>
    );
}
