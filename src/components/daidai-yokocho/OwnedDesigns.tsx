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
    return (
        <li className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-4">
                <DesignSwatch data={data} className="w-24 h-16 shrink-0 rounded-lg border border-gray-200" />
                <div className="min-w-0 flex-1">
                    <Link href={`/daidai-yokocho/designs/${pack.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        {pack.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                        {brightnessLabel[pack.brightness] ?? ""}　版{pack.version}
                    </p>
                </div>
                {note && <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${note.className}`}>{note.label}</span>}
            </div>
            {pack.status === "suspended" && <p className="text-xs text-red-600">配信が停止されたため、アプリの表示は標準に戻ります。</p>}

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                {confirming ? (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-700">取得を外しますか？ 着せ替えが標準に戻ります。</span>
                        <button type="button" disabled={busy} onClick={remove} className="font-bold text-red-600 hover:text-red-800 disabled:opacity-40">
                            外す
                        </button>
                        <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-800">
                            やめる
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="self-start text-sm text-gray-500 hover:text-red-600 underline underline-offset-4">
                        取得を外す
                    </button>
                )}
                {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
            </div>
        </li>
    );
}

// 取得済みの意匠パック（「購入済み」の意匠の側）。取り下げ・停止のものも含め、いつでも外せる
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

    if (failed) return <p className="text-sm text-red-600">取得済みの意匠パックを読み込めませんでした。</p>;
    if (packs === null) return <p className="text-sm text-gray-400">読み込み中…</p>;
    if (packs.length === 0) {
        return (
            <p className="text-gray-400 text-sm">
                まだ意匠パックを取得していません。
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
