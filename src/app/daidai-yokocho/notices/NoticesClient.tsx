"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { demoNotices, formatNoticeContent, noticeKindMeta, type Notice, type NoticeTone } from "@/lib/notices";
import { fetchNotices, markNoticesRead } from "@/lib/noticesClient";

const NOTICES_PATH = "/daidai-yokocho/notices";

const toneClass: Record<NoticeTone, string> = {
    success: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
    warning: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
    danger: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
    neutral: "bg-surface-container-high text-on-surface-variant",
};

function formatDate(d: Date | null): string {
    if (!d) return "";
    return d.toLocaleString("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NoticesClient() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [notices, setNotices] = useState<Notice[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    useEffect(() => {
        if (ready && !user) router.replace(`/login?redirect=${encodeURIComponent(NOTICES_PATH)}`);
    }, [ready, user, router]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        // 開発中だけ、?demo=1 で見本を出す。本番のビルドでは、この分岐ごと取り除かれる
        const demo =
            process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("demo") === "1";
        (demo ? Promise.resolve(demoNotices()) : fetchNotices(user.uid))
            .then((list) => {
                if (cancelled) return;
                setNotices(list);
                // 開いた時に既読にする。失敗しても画面には出さない（バッジが残るだけ）
                if (!demo) markNoticesRead(user.uid).catch((err) => console.error("既読にできませんでした:", err));
            })
            .catch((err) => {
                console.error("お知らせを読み込めませんでした:", err);
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (!ready || !user) return null;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-3xl">
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-widest text-on-surface mb-12">
                    <Bell className="w-7 h-7 shrink-0" aria-hidden />
                    お知らせ
                </h1>

                {failed ? (
                    <p className="text-sm text-red-600 dark:text-red-400">お知らせを読み込めませんでした。時間をおいて、もう一度お試しください。</p>
                ) : notices === null ? (
                    <p className="text-sm text-outline">読み込み中…</p>
                ) : notices.length === 0 ? (
                    <p className="text-sm text-outline">お知らせは有りません。</p>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {notices.map((n) => {
                            const meta = noticeKindMeta(n.kind);
                            return (
                                <li key={n.id} className="rounded-2xl bg-surface-container-lowest/80 border border-glass-edge/70 shadow-sm p-5 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        {meta && (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${toneClass[meta.tone]}`}>
                                                {meta.title}
                                            </span>
                                        )}
                                        <time className="text-xs text-outline">{formatDate(n.createdAt)}</time>
                                    </div>
                                    <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">{formatNoticeContent(n.content)}</p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
