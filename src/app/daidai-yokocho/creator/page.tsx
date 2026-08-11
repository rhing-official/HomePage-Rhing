"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import {
    getStickerPacksByCreator,
    getAllTags,
    formatPackPrice,
    STICKER_PACK_CATEGORIES,
    type StickerPack,
} from "@/lib/stickerPacks";
import { uploadStickerPackAsset } from "@/lib/firebaseStorage";
import {
    createStickerPack,
    updateStickerPackMeta,
    addStickersToStickerPack,
    deleteStickerPack,
    type StickerInput,
} from "@/lib/firebaseFunctions";

const MIN_STICKERS_PER_PACK = 4;
const MAX_TAGS = 5;

async function uploadFiles(uid: string, files: File[]): Promise<StickerInput[]> {
    const stickers: StickerInput[] = [];
    for (const file of files) {
        const imageUrl = await uploadStickerPackAsset(uid, file);
        stickers.push({
            stickerId: crypto.randomUUID(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            imageUrl,
        });
    }
    return stickers;
}

const CREATOR_PATH = "/daidai-yokocho/creator";

export default function CreatorDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [packs, setPacks] = useState<StickerPack[]>([]);
    const [loadingPacks, setLoadingPacks] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

    useEffect(() => onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
    }), []);

    // 未ログインならログインページに送り、処理後はこのページへ自動で戻す。
    useEffect(() => {
        if (ready && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(CREATOR_PATH)}`);
        }
    }, [ready, user, router]);

    const reloadPacks = useCallback(async (uid: string) => {
        setLoadingPacks(true);
        try {
            setPacks(await getStickerPacksByCreator(uid));
        } finally {
            setLoadingPacks(false);
        }
    }, []);

    useEffect(() => {
        if (user) reloadPacks(user.uid);
    }, [user, reloadPacks]);

    useEffect(() => {
        getAllTags().then(setTagSuggestions);
    }, []);

    if (!ready || !user) return null;

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="mb-12">
                    <Link href="/daidai-yokocho" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                        ← daidai横丁に戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-widest text-gray-900 mt-4">出品者ダッシュボード</h1>
                </div>

                <CreatePackForm
                    uid={user.uid}
                    tagSuggestions={tagSuggestions}
                    onCreated={() => reloadPacks(user.uid)}
                />

                <div className="mt-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">自分のパック</h2>
                    {loadingPacks ? (
                        <p className="text-gray-400 text-sm">読み込み中...</p>
                    ) : packs.length === 0 ? (
                        <p className="text-gray-400 text-sm">まだパックを出品していません。</p>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {packs.map((pack) => (
                                <PackEditor
                                    key={pack.id}
                                    pack={pack}
                                    uid={user.uid}
                                    onChanged={() => reloadPacks(user.uid)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CreatePackForm({
    uid,
    tagSuggestions,
    onCreated,
}: {
    uid: string;
    tagSuggestions: string[];
    onCreated: () => void;
}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = name.trim() !== "" && files.length >= MIN_STICKERS_PER_PACK;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        setError(null);
        setSubmitting(true);
        try {
            const stickers = await uploadFiles(uid, files);
            await createStickerPack({
                name: name.trim(),
                price: 0,
                stickers,
                category,
                tags,
            });
            setName("");
            setCategory("");
            setTags([]);
            setFiles([]);
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
            <h2 className="text-xl font-bold text-gray-900">新規パックを作成</h2>

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
                <ImagePicker files={files} onChange={setFiles} label="画像を選択" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={!isValid || submitting}
                className={`self-start px-8 py-3 rounded-full shadow-lg transition ${
                    isValid && !submitting
                        ? "bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
            >
                {submitting ? "作成中..." : "パックを作成する"}
            </button>
        </form>
    );
}

function PackEditor({
    pack,
    uid,
    onChanged,
}: {
    pack: StickerPack;
    uid: string;
    onChanged: () => void;
}) {
    const [name, setName] = useState(pack.name);
    const [price, setPrice] = useState(String(pack.price));
    const [savingMeta, setSavingMeta] = useState(false);
    const [metaError, setMetaError] = useState<string | null>(null);

    const [addingImages, setAddingImages] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const addInputRef = useRef<HTMLInputElement>(null);

    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const canDelete = pack.ownerCount === 0;

    const handleSaveMeta = async () => {
        setMetaError(null);
        const trimmedName = name.trim();
        const priceValue = Number(price);
        if (!trimmedName) {
            setMetaError("パック名を入力してください");
            return;
        }
        if (!Number.isInteger(priceValue) || priceValue < 0) {
            setMetaError("価格は0以上の整数で入力してください");
            return;
        }
        if (priceValue > 0 && priceValue !== pack.price) {
            setMetaError("有料パックの出品は準備中のため、価格は0円のみ設定できます");
            return;
        }
        setSavingMeta(true);
        try {
            await updateStickerPackMeta({ packId: pack.id, name: trimmedName, price: priceValue });
            onChanged();
        } catch (err) {
            setMetaError(err instanceof Error ? err.message : "更新に失敗しました");
        } finally {
            setSavingMeta(false);
        }
    };

    const handleAddImages = async (fileList: FileList | null) => {
        const files = Array.from(fileList ?? []);
        if (files.length === 0) return;
        setAddError(null);
        setAddingImages(true);
        try {
            const stickers = await uploadFiles(uid, files);
            await addStickersToStickerPack({ packId: pack.id, stickers });
            onChanged();
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "追加に失敗しました");
        } finally {
            setAddingImages(false);
        }
    };

    const handleDelete = async () => {
        setDeleteError(null);
        setDeleting(true);
        try {
            await deleteStickerPack({ packId: pack.id });
            onChanged();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "削除に失敗しました");
            setDeleting(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={`/daidai-yokocho/${pack.id}`}
                    className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    詳細ページを見る →
                </Link>
                <span className="text-xs text-gray-400">売上数: {pack.salesCount} / 利用者数: {pack.ownerCount}</span>
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

            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 bg-white/70 text-sm"
                />
                <input
                    type="number"
                    min={0}
                    step={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-32 rounded-lg border border-gray-200 px-4 py-2 bg-white/70 text-sm"
                />
                <button
                    onClick={handleSaveMeta}
                    disabled={savingMeta}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                    {savingMeta ? "保存中..." : "保存"}
                </button>
            </div>
            {metaError && <p className="text-xs text-red-600">{metaError}</p>}
            <p className="text-xs text-gray-400">
                現在の価格: {formatPackPrice(pack.price)}
                {pack.price === 0 && "（有料パックの出品は準備中のため、当面は無料のみ設定できます）"}
            </p>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                <input
                    ref={addInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        handleAddImages(e.target.files);
                        e.target.value = "";
                    }}
                />
                <button
                    type="button"
                    onClick={() => addInputRef.current?.click()}
                    disabled={addingImages}
                    className="self-start text-sm font-bold text-gray-600 border border-gray-300 rounded-full px-5 py-2 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                    {addingImages ? "追加中..." : "画像を追加"}
                </button>
                <p className="text-xs text-gray-400">選択すると即座に追加されます（削除・差し替えは不可）</p>
            </div>
            {addError && <p className="text-xs text-red-600">{addError}</p>}

            <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
                {confirmingDelete ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-gray-700">本当に削除しますか？この操作は取り消せません。</span>
                        <button
                            onClick={() => setConfirmingDelete(false)}
                            disabled={deleting}
                            className="text-sm px-4 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            やめる
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-sm px-4 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {deleting ? "削除中..." : "削除する"}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmingDelete(true)}
                        disabled={!canDelete}
                        title={canDelete ? undefined : "現在利用しているユーザーがいるため削除できません"}
                        className="self-start text-sm font-bold text-red-600 hover:text-red-800 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                        このパックを削除する
                    </button>
                )}
                {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            </div>
        </div>
    );
}

// ファイル選択ボタン＋サムネイルプレビューで、視覚的に何が選ばれているか分かるようにする。
function ImagePicker({
    files,
    onChange,
    label,
}: {
    files: File[];
    onChange: (files: File[]) => void;
    label: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

    useEffect(() => {
        return () => previews.forEach((u) => URL.revokeObjectURL(u));
    }, [previews]);

    return (
        <div className="flex flex-col gap-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    onChange([...files, ...Array.from(e.target.files ?? [])]);
                    e.target.value = "";
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="self-start text-sm font-bold text-gray-600 border border-gray-300 rounded-full px-5 py-2 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
                {label}
            </button>
            {files.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {files.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white/70">
                            {previews[i] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previews[i]} alt={file.name} className="w-full h-full object-contain" />
                            )}
                            <button
                                type="button"
                                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                                className="absolute top-0 right-0 bg-black/60 text-white text-xs w-5 h-5 flex items-center justify-center leading-none"
                                aria-label={`${file.name}を削除`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
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
                    <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
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
