"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { getAllTags } from "@/lib/stickerPacks";
import { getStickerRoles, type StickerRoleOption } from "@/lib/stickerRoles";
import { getPackDraft, type PackDraft } from "@/lib/packDrafts";
import PackEditHeader from "@/components/daidai-yokocho/PackEditHeader";
import CreatePackForm from "@/components/daidai-yokocho/CreatePackForm";

const CREATOR_PATH = "/daidai-yokocho/creator";

// 下書きの、パックの編集画面（「作成と管理」の一覧の、下書きの「編集」から来る）。
// 「下書き保存」で保存し直し、「公開する」でパックとして公開できる。
export default function EditDraftPage({ params }: { params: Promise<{ draftId: string }> }) {
    const { draftId } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [draft, setDraft] = useState<PackDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [roleOptions, setRoleOptions] = useState<StickerRoleOption[]>([]);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(`${CREATOR_PATH}/drafts/${draftId}`)}`);
        }
    }, [ready, user, router, draftId]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        getPackDraft(user.uid, draftId).then((d) => {
            if (cancelled) return;
            setDraft(d);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [user, draftId]);

    useEffect(() => {
        getAllTags().then(setTagSuggestions);
        getStickerRoles().then(setRoleOptions);
    }, []);

    if (!ready || !user) return null;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-4xl">
                <PackEditHeader status="draft" />

                {loading ? (
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : !draft ? (
                    <p className="text-gray-500 text-sm">編集できる下書きが見つかりません。</p>
                ) : (
                    <CreatePackForm
                        uid={user.uid}
                        tagSuggestions={tagSuggestions}
                        roleOptions={roleOptions}
                        draft={draft}
                        draftCount={0}
                        onDraftsChanged={() => {}}
                        onCreated={() => router.replace(CREATOR_PATH)}
                    />
                )}
            </div>
        </div>
    );
}
