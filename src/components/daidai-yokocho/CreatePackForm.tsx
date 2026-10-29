"use client";

import { useRef, useState } from "react";
import { STICKER_PACK_CATEGORIES } from "@/lib/stickerPacks";
import type { StickerRoleOption } from "@/lib/stickerRoles";
import { createStickerPack } from "@/lib/firebaseFunctions";
import StickerImagePicker, {
    draftEntryId,
    uploadFiles,
    type StickerDraft,
} from "@/components/daidai-yokocho/StickerImagePicker";
import {
    DRAFT_MAX,
    canSaveDraft,
    deletePackDraft,
    removedImageUrls,
    savePackDraft,
    type PackDraft,
} from "@/lib/packDrafts";
import { deleteStickerPackAssetByUrl } from "@/lib/firebaseStorage";

const MIN_STICKERS_PER_PACK = 4;
const MAX_TAGS = 5;

// パックの新規作成（または、下書きのパックの編集）フォーム。「下書き保存」と「公開する」の2つのボタンがある
export default function CreatePackForm({
    uid,
    tagSuggestions,
    roleOptions,
    draft,
    draftCount,
    onDraftsChanged,
    onCreated,
}: {
    uid: string;
    tagSuggestions: string[];
    roleOptions: StickerRoleOption[];
    // 編集する下書き（なければ新規）。別の下書きに切り替えるときは、keyを変えて作り直す
    draft: PackDraft | null;
    draftCount: number;
    onDraftsChanged: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState(draft?.name ?? "");
    const [category, setCategory] = useState(draft?.category ?? "");
    const [tags, setTags] = useState<string[]>(draft?.tags ?? []);
    const [stickers, setStickers] = useState<StickerDraft[]>(
        () => (draft?.stickers ?? []).map((s) => ({ uploaded: s, roles: s.roles })),
    );
    // パックの代表にする画像の位置（初期は先頭、下書きなら保存した代表）。画像を減らして範囲外になったら、先頭に戻す
    const [coverIndex, setCoverIndex] = useState(() => {
        const i = draft ? draft.stickers.findIndex((s) => s.stickerId === draft.coverStickerId) : -1;
        return i >= 0 ? i : 0;
    });
    const effectiveCover = coverIndex < stickers.length ? coverIndex : 0;
    const [submitting, setSubmitting] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    // 保存済みの下書き（なければnull）と、その時点の画像（保存し直したときの掃除用）
    const [draftId, setDraftId] = useState<string | null>(draft?.id ?? null);
    const savedStickers = useRef(draft?.stickers ?? []);

    // 画像が増減しても、代表に選んだ画像が、そのまま代表であり続けるようにする（消えたら先頭）
    const handleStickersChange = (next: StickerDraft[]) => {
        const coverId = stickers[effectiveCover] ? draftEntryId(stickers[effectiveCover]) : undefined;
        const moved = coverId ? next.findIndex((e) => draftEntryId(e) === coverId) : -1;
        setCoverIndex(moved >= 0 ? moved : 0);
        setStickers(next);
        setNotice(null);
    };

    const isValid = name.trim() !== "" && stickers.length >= MIN_STICKERS_PER_PACK;
    const busy = submitting || savingDraft;

    // アップロード後は、全ての画像を「アップロード済み」にして、再度の保存・公開で再アップロードしない
    const uploadAll = async () => {
        const inputs = await uploadFiles(uid, stickers);
        setStickers(inputs.map((s) => ({ uploaded: s, roles: s.roles })));
        return inputs;
    };

    const handleSaveDraft = async () => {
        if (!canSaveDraft(name, stickers.length) || busy) return;
        if (!draftId && draftCount >= DRAFT_MAX) {
            setError(`下書きは${DRAFT_MAX}件までです。不要な下書きを削除してください。`);
            return;
        }
        setError(null);
        setNotice(null);
        setSavingDraft(true);
        try {
            const inputs = await uploadAll();
            const id = await savePackDraft(uid, draftId, {
                name: name.trim(),
                category,
                tags,
                stickers: inputs,
                coverStickerId: inputs[effectiveCover]?.stickerId ?? null,
            });
            // 下書きから外した画像は、Storageからも消す
            await Promise.all(removedImageUrls(savedStickers.current, inputs).map(deleteStickerPackAssetByUrl));
            savedStickers.current = inputs;
            setDraftId(id);
            setNotice("下書きを保存しました");
            onDraftsChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "下書きの保存に失敗しました");
        } finally {
            setSavingDraft(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || busy) return;
        setError(null);
        setNotice(null);
        setSubmitting(true);
        try {
            const stickerInputs = await uploadAll();
            await createStickerPack({
                name: name.trim(),
                price: 0,
                stickers: stickerInputs,
                category,
                tags,
                coverStickerId: stickerInputs[effectiveCover]?.stickerId,
            });
            // 下書きから公開したら、下書きは消す（画像は、パックが使うので消さない）
            if (draftId) {
                try {
                    await deletePackDraft(uid, { id: draftId, stickers: stickerInputs }, false);
                } catch {
                    // 下書きが残っても、公開は成功している
                }
            }
            setName("");
            setCategory("");
            setTags([]);
            setStickers([]);
            setCoverIndex(0);
            setDraftId(null);
            savedStickers.current = [];
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "作成に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-3xl p-8 flex flex-col gap-5"
        >
            {/* 下書きの編集画面では、ページの見出し「パックの編集」があるので、フォームの見出しは出さない */}
            {!draft && <h2 className="text-xl font-bold text-gray-900">新規パックを作成</h2>}

            <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                パック名
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-gray-200 px-4 py-2 bg-white/70"
                />
            </label>

            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                価格: 無料（0円）— 有料パックの出品は準備中のため、現在は無料配布のみ対応しています。
            </p>

            <label className="flex flex-col gap-1.5 text-sm text-gray-600">
                カテゴリ（任意）
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg border border-gray-200 px-4 py-2 bg-white/70"
                >
                    <option value="">選択しない</option>
                    {STICKER_PACK_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </label>

            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                タグ（任意、最大{MAX_TAGS}個）
                <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                画像（{MIN_STICKERS_PER_PACK}枚以上、GIF/WebPアニメーション対応）
                <p className="text-xs text-gray-400">
                    それぞれに役割を設定すると、メッセージ内容に応じたぺったん提案（DaiDaiアプリ側の機能）に使われます（任意）
                </p>
                <StickerImagePicker
                    entries={stickers}
                    onChange={handleStickersChange}
                    roleOptions={roleOptions}
                    label="画像を選択"
                    coverIndex={effectiveCover}
                    onCoverChange={setCoverIndex}
                />
                {stickers.length > 0 && (
                    <p className="text-xs text-gray-400">★をつけた画像が、パックの代表（一覧などに最初に出る画像）になります。</p>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && <p className="text-sm text-emerald-700" role="status">{notice}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!canSaveDraft(name, stickers.length) || busy}
                    className="px-8 py-3 rounded-full border border-primary/50 text-primary font-bold hover:bg-primary-container/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {savingDraft ? "保存中..." : "下書き保存"}
                </button>
                <button
                    type="submit"
                    disabled={!isValid || busy}
                    className={`px-8 py-3 rounded-full shadow-lg font-bold transition ${isValid && !busy
                        ? "bg-primary text-on-primary hover:bg-primary/90 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                >
                    {submitting ? "公開中..." : "公開する"}
                </button>
            </div>
            {!isValid && (
                <p className="text-xs text-gray-400">公開するには、パック名と、{MIN_STICKERS_PER_PACK}枚以上の画像が必要です。途中なら、下書き保存ができます。</p>
            )}
        </form>
    );
}

// noteのハッシュタグ入力のように、文字を打つと候補が絞り込まれるタグ入力欄。
// #付きのチップで表示し、最大MAX_TAGS個まで登録できる。
function TagInput({
    tags,
    onChange,
    suggestions,
}: {
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions: string[];
}) {
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filtered = input.trim()
        ? suggestions.filter((s) => s.includes(input.trim()) && !tags.includes(s)).slice(0, 8)
        : [];

    const addTag = (raw: string) => {
        const tag = raw.trim().replace(/^#/, "");
        if (!tag || tags.length >= MAX_TAGS || tags.includes(tag)) return;
        onChange([...tags, tag]);
        setInput("");
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-white/70">
                {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-primary-container text-on-primary-container text-sm px-3 py-1 rounded-full">
                        #{tag}
                        <button
                            type="button"
                            onClick={() => onChange(tags.filter((t) => t !== tag))}
                            className="text-gray-400 hover:text-gray-700"
                            aria-label={`${tag}を削除`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                {tags.length < MAX_TAGS && (
                    <input
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addTag(input);
                            } else if (e.key === "Backspace" && !input && tags.length > 0) {
                                onChange(tags.slice(0, -1));
                            }
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder={tags.length === 0 ? "入力してEnter、または候補から選択" : ""}
                        className="flex-1 min-w-[8em] outline-none text-sm bg-transparent"
                    />
                )}
            </div>
            {showSuggestions && filtered.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
                    {filtered.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => addTag(s)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            #{s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
