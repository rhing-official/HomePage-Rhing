"use client";

import { Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ImageViewer from "@/components/ImageViewer";
import type { StickerRoleOption } from "@/lib/stickerRoles";
import { uploadStickerPackAsset } from "@/lib/firebaseStorage";
import type { StickerInput } from "@/lib/firebaseFunctions";
import { STICKER_ALLOWED_TYPES, STICKER_MAX_BYTES, STICKER_MAX_SIDE_PX, prepareStickerImage } from "@/lib/stickerImageSpec";

// 画像1枚と、それに設定する役割id（未設定は空配列、単一選択UIのため常に0〜1件）の組。
// 新しく選んだ画像（file）か、下書きから復元したアップロード済みの画像（uploaded）のどちらか。
export interface StickerDraft {
    file?: File;
    uploaded?: StickerInput;
    roles: string[];
}

// 画像の同一性（役割を変えても変わらない）。新規はFile、アップロード済みはstickerId
export function draftEntryId(entry: StickerDraft): File | string | undefined {
    return entry.file ?? entry.uploaded?.stickerId;
}

function draftEntryName(entry: StickerDraft): string {
    return entry.file ? entry.file.name : (entry.uploaded?.name ?? "");
}

// アップロード済みの画像は、そのまま通す（再アップロードしない）。新規の画像だけをアップロードする
export async function uploadFiles(uid: string, entries: StickerDraft[]): Promise<StickerInput[]> {
    const stickers: StickerInput[] = [];
    for (const entry of entries) {
        if (entry.uploaded) {
            stickers.push({ ...entry.uploaded, roles: entry.roles });
            continue;
        }
        if (!entry.file) continue;
        const imageUrl = await uploadStickerPackAsset(uid, entry.file);
        stickers.push({
            stickerId: crypto.randomUUID(),
            name: entry.file.name.replace(/\.[^/.]+$/, ""),
            imageUrl,
            roles: entry.roles,
        });
    }
    return stickers;
}

// ファイル選択ボタン＋サムネイルプレビュー＋役割選択で、画像1枚ごとに役割を割り振れるようにする。
export default function StickerImagePicker({
    entries,
    onChange,
    roleOptions,
    label,
    coverIndex,
    onCoverChange,
}: {
    entries: StickerDraft[];
    onChange: (entries: StickerDraft[]) => void;
    roleOptions: StickerRoleOption[];
    label: string;
    // 指定すると、画像ごとに「ぺったんの代表にする」ボタンが出る（新規作成用）
    coverIndex?: number;
    onCoverChange?: (index: number) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    // 規格に合わず追加できなかった画像と、その理由
    const [rejected, setRejected] = useState<string[]>([]);
    // 拡大表示している画像の番号（nullなら閉じている）
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    // 新規の画像はobjectURL、アップロード済みの画像は、保存されているURLを使う
    const previews = useMemo(
        () => entries.map((entry) => (entry.file ? URL.createObjectURL(entry.file) : (entry.uploaded?.imageUrl ?? ""))),
        [entries],
    );

    useEffect(() => {
        return () => previews.forEach((u, i) => {
            if (entries[i]?.file) URL.revokeObjectURL(u);
        });
    }, [previews, entries]);

    return (
        <div className="flex flex-col gap-3">
            <input
                ref={inputRef}
                type="file"
                accept={STICKER_ALLOWED_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    const accepted: StickerDraft[] = [];
                    const errors: string[] = [];
                    for (const file of files) {
                        const result = await prepareStickerImage(file);
                        if ("error" in result) errors.push(`${file.name}: ${result.error}`);
                        else accepted.push({ file: result.file, roles: [] });
                    }
                    setRejected(errors);
                    if (accepted.length > 0) onChange([...entries, ...accepted]);
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="self-start text-sm font-bold text-primary border border-primary/50 rounded-full px-5 py-2 hover:bg-primary-container/60 transition-colors"
            >
                {label}
            </button>
            <p className="text-xs text-on-surface-subtle">
                PNG・WebP・JPEG・GIF／長辺{STICKER_MAX_SIDE_PX}px以下（SVGは対象外）／1枚{STICKER_MAX_BYTES / 1024 / 1024}MBまで。画像をクリックすると、拡大して見られます
            </p>
            {rejected.length > 0 && (
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5" role="alert">
                    {rejected.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>
            )}
            {entries.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {entries.map((entry, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-20">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-lowest/70">
                                {previews[i] && (
                                    <button
                                        type="button"
                                        onClick={() => setViewerIndex(i)}
                                        aria-label={`${draftEntryName(entry)}を拡大して表示`}
                                        className="absolute inset-0 w-full h-full cursor-zoom-in"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previews[i]} alt="" className="w-full h-full object-contain" />
                                    </button>
                                )}
                                {onCoverChange && (
                                    <button
                                        type="button"
                                        onClick={() => onCoverChange(i)}
                                        aria-pressed={coverIndex === i}
                                        aria-label={coverIndex === i ? "ぺったんの代表（選択中）" : "ぺったんの代表にする"}
                                        className="absolute bottom-0 left-0 bg-surface-container-lowest/85 w-5 h-5 flex items-center justify-center"
                                    >
                                        <Star className={`w-3.5 h-3.5 ${coverIndex === i ? "text-amber-500 dark:text-amber-400 fill-amber-500" : "text-outline"}`} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
                                    className="absolute top-0 right-0 bg-black/60 text-white text-xs w-5 h-5 flex items-center justify-center leading-none"
                                    aria-label={`${draftEntryName(entry)}を削除`}
                                >
                                    ×
                                </button>
                            </div>
                            <select
                                value={entry.roles[0] ?? ""}
                                onChange={(e) => {
                                    const next = [...entries];
                                    next[i] = { ...entry, roles: e.target.value ? [e.target.value] : [] };
                                    onChange(next);
                                }}
                                className="w-full text-[11px] rounded border border-outline-variant bg-surface-container-lowest/70 px-1 py-0.5"
                            >
                                <option value="">役割なし</option>
                                {roleOptions.map((r) => (
                                    <option key={r.roleId} value={r.roleId}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
            <AnimatePresence>
                {viewerIndex !== null && viewerIndex < entries.length && (
                    <ImageViewer
                        images={entries.map((entry, i) => ({ url: previews[i], name: draftEntryName(entry) }))}
                        index={viewerIndex}
                        onIndexChange={setViewerIndex}
                        onClose={() => setViewerIndex(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
