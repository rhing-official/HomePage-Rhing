"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getOwnedStickerPacks, formatPackPrice, type StickerPack } from "@/lib/stickerPacks";
import { uninstallStickerPack } from "@/lib/firebaseFunctions";

const OWNED_PATH = "/daidai-yokocho/owned";

export default function OwnedStickerPacksPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [loadingPacks, setLoadingPacks] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    // 未ログインならログインページに送り、処理後はこのページへ自動で戻す。
    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(OWNED_PATH)}`);
        }
    }, [ready, user, router]);

    const reloadPacks = useCallback(async (uid: string) => {
        setLoadingPacks(true);
        try {
            setPacks(await getOwnedStickerPacks(uid));
        } finally {
            setLoadingPacks(false);
        }
    }, []);

    useEffect(() => {
        if (user) reloadPacks(user.uid);
    }, [user, reloadPacks]);

    if (!ready || !user) return null;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="mb-12">
                    <Link href="/login" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                        ← アカウントページに戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-widest text-gray-900 mt-4">所持しているペタピタ</h1>
                </div>

                {loadingPacks ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : packs.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        まだペタピタを所持していません。
                        <Link href="/daidai-yokocho" className="text-blue-600 hover:underline ml-1">
                            daidai横丁で探す →
                        </Link>
                    </p>
                ) : (
                    <div className="flex flex-col gap-6">
                        {packs.map((pack) => (
                            <OwnedPackCard
                                key={pack.id}
                                pack={pack}
                                onUninstalled={() => setPacks((prev) => prev.filter((p) => p.id !== pack.id))}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function OwnedPackCard({
    pack,
    onUninstalled,
}: {
    pack: StickerPack;
    onUninstalled: () => void;
}) {
    const [confirming, setConfirming] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUninstall = async () => {
        setError(null);
        setUninstalling(true);
        try {
            await uninstallStickerPack({ packId: pack.id });
            onUninstalled();
        } catch (err) {
            setError(err instanceof Error ? err.message : "アンインストールに失敗しました");
            setUninstalling(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={`/daidai-yokocho/${pack.id}`}
                    className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                    {pack.name}
                </Link>
                <span className="text-xs text-gray-400">{formatPackPrice(pack.price)}</span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {pack.stickers.map((sticker, i) => (
                    <div key={sticker.stickerId || i} className="aspect-square bg-white/60 border border-white/80 rounded-lg overflow-hidden">
                        {sticker.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sticker.imageUrl} alt={sticker.name} className="w-full h-full object-contain p-1" />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                {confirming ? (
                    <div className="flex flex-col gap-3">
                        <span className="text-sm text-gray-700">
                            本当にアンインストールしますか？このパックのペタピタが送信できなくなります。
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                disabled={uninstalling}
                                className="text-sm px-5 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                やめる
                            </button>
                            <button
                                type="button"
                                onClick={handleUninstall}
                                disabled={uninstalling}
                                className="text-sm px-5 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {uninstalling ? "アンインストール中..." : "アンインストール"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="self-start text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
                    >
                        アンインストールする
                    </button>
                )}
                {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
        </div>
    );
}
