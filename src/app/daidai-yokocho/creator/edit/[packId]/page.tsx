"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getStickerPackById, type StickerPack } from "@/lib/stickerPacks";
import { getStickerRoles, type StickerRoleOption } from "@/lib/stickerRoles";
import PackEditHeader from "@/components/daidai-yokocho/PackEditHeader";
import PackEditor from "@/components/daidai-yokocho/PackEditor";

const CREATOR_PATH = "/daidai-yokocho/creator";

// 作成済みのパックの編集画面（「作成と管理」の一覧の「編集」から来る）
export default function EditPackPage({ params }: { params: Promise<{ packId: string }> }) {
    const { packId } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [pack, setPack] = useState<StickerPack | null>(null);
    const [loading, setLoading] = useState(true);
    const [roleOptions, setRoleOptions] = useState<StickerRoleOption[]>([]);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(`${CREATOR_PATH}/edit/${packId}`)}`);
        }
    }, [ready, user, router, packId]);

    // 保存や画像の追加のあと、パックを読み直す（versionを進めて、下の取得を再実行する）
    const [version, setVersion] = useState(0);
    const reload = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        getStickerPackById(packId).then((p) => {
            if (cancelled) return;
            setPack(p);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [user, packId, version]);

    useEffect(() => {
        getStickerRoles().then(setRoleOptions);
    }, []);

    if (!ready || !user) return null;

    // 自分のパックだけ編集できる（サーバー側でも、出品者かどうかを確認している）
    const editable = pack !== null && pack.creatorId === user.uid;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <PackEditHeader status="published" />

                {loading ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : !editable ? (
                    <p className="text-gray-500 text-sm">編集できるパックが見つかりません。</p>
                ) : (
                    <PackEditor
                        pack={pack}
                        uid={user.uid}
                        roleOptions={roleOptions}
                        onChanged={reload}
                        onDeleted={() => router.replace(CREATOR_PATH)}
                    />
                )}
            </div>
        </div>
    );
}
