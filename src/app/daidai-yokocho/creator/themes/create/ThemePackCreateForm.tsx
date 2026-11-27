"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Palette } from "lucide-react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import ThemePackPreview from "@/components/daidai-yokocho/ThemePackPreview";
import { buildThemePackZip, emptyDraft, newPackId, type ThemePackDraft } from "@/lib/themePack/build";
import { clearDraft, loadDraft, saveDraft } from "@/lib/themePack/draftStore";
import { checkContrast, MIN_CONTRAST_RATIO } from "@/lib/themePack/contrast";
import { readImageInfo } from "@/lib/themePack/imageSize";
import { COLOR_KEYS, COLOR_LABELS, SHAPE_RANGES, THEME_PACK_LIMITS, type ThemePackBrightness, type ThemePackColorKey } from "@/lib/themePack/spec";
import { getMyThemePackSubmission, loadThemePackDraft, type ThemePackSubmission } from "@/lib/themePackReview";
import { validateThemePackZip } from "@/lib/themePack/validate";
import { formatBytes } from "@/lib/themePack/zip";
import { ResultList } from "../new/ThemePackSubmitForm";
import SubmitPanel from "../new/SubmitPanel";

const BASE_PATH = "/daidai-yokocho/creator/themes/create";
const HEX = /^#[0-9a-fA-F]{6}$/;

const card = "rounded-m3-lg bg-surface-container-lowest border border-outline-variant shadow-sm p-6 flex flex-col gap-4";
const input = "w-full rounded-lg border border-outline/50 px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary";

export default function ThemePackCreateForm() {
    const router = useRouter();
    // `?from=投稿のid`: 投稿済みの意匠から、新しい版を作る。下書きの保存とは、別に扱う（保存済みの下書きを、上書きしない）
    const fromId = useSearchParams().get("from");
    const PAGE_PATH = fromId ? `${BASE_PATH}?from=${encodeURIComponent(fromId)}` : BASE_PATH;
    const [base, setBase] = useState<ThemePackSubmission | null>(null);
    const [baseError, setBaseError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [draft, setDraft] = useState<ThemePackDraft>(emptyDraft);
    const [loaded, setLoaded] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const bgInput = useRef<HTMLInputElement>(null);
    const chipInput = useRef<HTMLInputElement>(null);

    useEffect(
        () =>
            onAuthStateChanged(auth, (u) => {
                setUser(u);
                setReady(true);
            }),
        [],
    );
    useEffect(() => {
        if (ready && !user) router.replace(`/login?redirect=${encodeURIComponent(PAGE_PATH)}`);
    }, [ready, user, router, PAGE_PATH]);

    // 下書きを、このブラウザの中から読む。新しい版を作る時は、投稿済みの素材から読む
    useEffect(() => {
        if (!ready || !user) return;
        if (fromId) {
            getMyThemePackSubmission(fromId, user.uid)
                .then(async (sub) => {
                    if (!sub) throw new Error("この投稿は、見つかりません。");
                    setDraft(await loadThemePackDraft(sub.assetPath));
                    setBase(sub);
                })
                .catch((err) => setBaseError(err instanceof Error ? err.message : "投稿を読み込めませんでした。"))
                .finally(() => setLoaded(true));
            return;
        }
        loadDraft()
            .then((d) => d && setDraft({ ...emptyDraft(), ...d, id: d.id || newPackId(), author: "" }))
            .catch(() => undefined)
            .finally(() => setLoaded(true));
    }, [ready, user, fromId]);

    // 入力が止まってから、下書きを保存する（新しい版を作る時は保存しない）
    useEffect(() => {
        if (!loaded || fromId) return;
        const t = setTimeout(() => {
            saveDraft(draft).then(
                () => setSaveError(false),
                () => setSaveError(true),
            );
        }, 600);
        return () => clearTimeout(t);
    }, [draft, loaded, fromId]);

    const result = useMemo(() => validateThemePackZip(buildThemePackZip(draft)), [draft]);

    // 画像の表示用URL。差し替えや離脱の時に解放する
    const bgBytes = draft.background?.bytes;
    const chipBytes = draft.menuChip?.bytes;
    const bgUrl = useBlobUrl(bgBytes, draft.background?.ext === "jpg" ? "image/jpeg" : `image/${draft.background?.ext ?? "png"}`);
    const chipUrl = useBlobUrl(chipBytes, "image/png");

    if (!ready || !user) return null;

    const set = (patch: Partial<ThemePackDraft>) => setDraft((d) => ({ ...d, ...patch }));
    const setColor = (scope: "light" | "dark", key: ThemePackColorKey, value: string) =>
        setDraft((d) => ({ ...d, colors: { ...d.colors, [scope]: { ...d.colors[scope], [key]: value } } }));
    const setShape = (patch: Partial<ThemePackDraft["shape"]>) => setDraft((d) => ({ ...d, shape: { ...d.shape, ...patch } }));

    const pickBackground = async (file: File) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const info = readImageInfo(bytes);
        const ext = info?.type === "jpeg" ? "jpg" : info?.type;
        if (!ext) {
            alert("png・webp・jpegの画像を選んでください。");
            return;
        }
        set({ background: { ext, bytes } });
    };
    const pickChip = async (file: File) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (readImageInfo(bytes)?.type !== "png") {
            alert("メニューチップには、pngの画像を選んでください。");
            return;
        }
        set({ menuChip: { bytes } });
    };

    const scopes: ("light" | "dark")[] = draft.brightness === "both" ? ["light", "dark"] : [draft.brightness];
    const live = result.pack
        ? { pack: result.pack, contrast: checkContrast(result.pack), backgroundUrl: bgUrl, menuChipUrl: chipUrl, warnings: result.warnings }
        : null;
    const lowContrast = live?.contrast.checks.filter((c) => !c.pass) ?? [];

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-3xl flex flex-col gap-8">
                <div>
                    <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-bold tracking-widest text-on-surface">
                        <Palette className="w-7 h-7 shrink-0" aria-hidden />
                        意匠を作る
                    </h1>
                    <p className="mt-3 text-sm text-on-surface-subtle leading-relaxed">
                        色・形・背景を選んで、意匠を作ります。作りかけは、このブラウザの中に自動で保存されます。サーバーには、投稿するまで送られません。
                        すでにzipを用意している場合は、
                        <Link href="/daidai-yokocho/creator/themes/new" className="underline underline-offset-2 hover:text-on-surface">
                            zipを投稿する画面
                        </Link>
                        へ進んでください。
                    </p>
                    {fromId && base && (
                        <p className="mt-3 rounded-lg bg-primary-container/50 px-4 py-3 text-sm text-on-surface leading-relaxed">
                            「{base.name ?? draft.name}」の新しい版（版{base.version + 1}）を作っています。送ると、運営の審査に進みます。この画面の内容は、下書きとしては保存されません。
                        </p>
                    )}
                    {baseError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{baseError}</p>}
                    {saveError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">下書きを保存できませんでした。このブラウザでは、保存が使えない可能性があります。</p>}
                </div>

                {/* 基本 */}
                <section className={card}>
                    <h2 className="font-bold text-on-surface">基本</h2>
                    <Field label="名前" hint="1〜40文字">
                        <input className={input} value={draft.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} />
                    </Field>
                    <Field label="対応する外観">
                        <select className={input} value={draft.brightness} onChange={(e) => set({ brightness: e.target.value as ThemePackBrightness })}>
                            <option value="both">明るい・暗いの両方</option>
                            <option value="light">明るいだけ</option>
                            <option value="dark">暗いだけ</option>
                        </select>
                    </Field>
                </section>

                {/* 形 */}
                <section className={card}>
                    <h2 className="font-bold text-on-surface">形</h2>
                    <Range
                        label="線の太さ"
                        value={draft.shape.borderWidth}
                        min={SHAPE_RANGES.borderWidth.min}
                        max={SHAPE_RANGES.borderWidth.max}
                        step={0.5}
                        onChange={(v) => setShape({ borderWidth: v })}
                    />
                    <Range label="角の丸み" value={draft.shape.radius} min={SHAPE_RANGES.radius.min} max={SHAPE_RANGES.radius.max} step={1} onChange={(v) => setShape({ radius: v })} />
                    <Range
                        label="影の横のずれ"
                        value={draft.shape.shadowOffset[0]}
                        min={SHAPE_RANGES.shadowOffset.min}
                        max={SHAPE_RANGES.shadowOffset.max}
                        step={1}
                        onChange={(v) => setShape({ shadowOffset: [v, draft.shape.shadowOffset[1]] })}
                    />
                    <Range
                        label="影の縦のずれ"
                        value={draft.shape.shadowOffset[1]}
                        min={SHAPE_RANGES.shadowOffset.min}
                        max={SHAPE_RANGES.shadowOffset.max}
                        step={1}
                        onChange={(v) => setShape({ shadowOffset: [draft.shape.shadowOffset[0], v] })}
                    />
                </section>

                {/* 色 */}
                {scopes.map((scope) => (
                    <section key={scope} className={card}>
                        <h2 className="font-bold text-on-surface">{scope === "light" ? "明るい外観の色" : "暗い外観の色"}</h2>
                        <p className="text-xs text-on-surface-subtle leading-relaxed">空にした色は、アプリが標準の色から決めます。</p>
                        {COLOR_KEYS.map((k) => (
                            <ColorField key={k} label={COLOR_LABELS[k]} value={draft.colors[scope][k] ?? ""} onChange={(v) => setColor(scope, k, v)} />
                        ))}
                    </section>
                ))}
                {lowContrast.length > 0 && (
                    <div className="rounded-m3-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-200 leading-relaxed" role="status">
                        文字の読みやすさが、基準の{MIN_CONTRAST_RATIO}を下回る組があります。下の「直してください」に、詳しく出ています。
                    </div>
                )}

                {/* 画像 */}
                <section className={card}>
                    <h2 className="font-bold text-on-surface">背景画像</h2>
                    <p className="text-xs text-on-surface-subtle leading-relaxed">
                        png・webp・jpegで、1枚{formatBytes(THEME_PACK_LIMITS.imageMaxBytes)}以下、各辺{THEME_PACK_LIMITS.imageMaxSide}px以下です。
                    </p>
                    <ImagePicker
                        inputRef={bgInput}
                        accept="image/png,image/webp,image/jpeg"
                        url={bgUrl}
                        info={bgBytes ? readImageInfo(bgBytes) : null}
                        size={bgBytes?.length}
                        onPick={pickBackground}
                        onRemove={() => set({ background: undefined })}
                    />
                </section>
                <section className={card}>
                    <h2 className="font-bold text-on-surface">メニューチップの画像</h2>
                    <p className="text-xs text-on-surface-subtle leading-relaxed">
                        pngで、透過できます。1枚{formatBytes(THEME_PACK_LIMITS.menuChipMaxBytes)}以下、各辺{THEME_PACK_LIMITS.menuChipMaxSide}px以下です。アプリでの表示には、アプリ側の対応が要ります。
                    </p>
                    <ImagePicker
                        inputRef={chipInput}
                        accept="image/png"
                        url={chipUrl}
                        info={chipBytes ? readImageInfo(chipBytes) : null}
                        size={chipBytes?.length}
                        onPick={pickChip}
                        onRemove={() => set({ menuChip: undefined })}
                    />
                </section>

                {/* プレビューと確認 */}
                <section className={card} aria-live="polite">
                    <h2 className="font-bold text-on-surface">プレビュー</h2>
                    {live ? <ThemePackPreview data={live} /> : <p className="text-sm text-on-surface-subtle">名前を入れると、プレビューが出ます。</p>}
                </section>
                {result.errors.length > 0 && <ResultList title="直してください" tone="error" items={result.errors} />}
                {result.warnings.length > 0 && <ResultList title="確認してください" tone="warning" items={result.warnings} />}
                {result.ok && result.passed.length > 0 && <ResultList title="確認できた項目" tone="ok" items={result.passed} />}

                <div className="flex items-center gap-4">
                    {!fromId && (
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm("作りかけの内容を、全て消します。よろしいですか。")) {
                                setDraft(emptyDraft());
                                void clearDraft();
                            }
                        }}
                        className="text-sm text-on-surface-subtle underline underline-offset-2 hover:text-on-surface"
                    >
                        最初からやり直す
                    </button>
                    )}
                </div>

                <SubmitPanel user={user} result={result} onSubmitted={() => (fromId ? undefined : void clearDraft())} />
            </div>
        </div>
    );
}

function useBlobUrl(bytes: Uint8Array | undefined, type: string): string | null {
    const url = useMemo(() => (bytes ? URL.createObjectURL(new Blob([bytes as BlobPart], { type })) : null), [bytes, type]);
    // 差し替えや離脱の時に解放する
    useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);
    return url;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-bold text-on-surface">{label}</span>
            {children}
            {hint && <span className="text-xs text-on-surface-subtle">{hint}</span>}
        </label>
    );
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
    return (
        <label className="flex items-center gap-4 text-sm text-on-surface">
            <span className="w-28 shrink-0 font-bold">{label}</span>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-primary" />
            <span className="w-10 text-right tabular-nums">{value}</span>
        </label>
    );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm font-bold text-on-surface">{label}</span>
            <input
                type="color"
                aria-label={`${label}の色を選ぶ`}
                value={HEX.test(value) ? value : "#808080"}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="h-9 w-12 shrink-0 cursor-pointer rounded border border-outline/50 bg-surface-container-lowest p-0.5"
            />
            <input className={input} value={value} placeholder="#RRGGBB（空で標準）" onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}

function ImagePicker({
    inputRef,
    accept,
    url,
    info,
    size,
    onPick,
    onRemove,
}: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    accept: string;
    url: string | null;
    info: { width: number; height: number } | null;
    size?: number;
    onPick: (f: File) => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="選んだ画像" className="h-20 w-20 rounded-lg border border-outline-variant bg-surface-container object-contain" />
            )}
            <div className="flex flex-col gap-2 items-start">
                {info && size !== undefined && (
                    <span className="text-xs text-on-surface-variant">
                        {info.width}×{info.height}、{formatBytes(size)}
                    </span>
                )}
                <div className="flex gap-3">
                    <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full border border-outline/50 px-4 py-1.5 text-sm font-bold text-on-surface hover:border-primary">
                        {url ? "選び直す" : "画像を選ぶ"}
                    </button>
                    {url && (
                        <button type="button" onClick={onRemove} className="text-sm text-on-surface-subtle underline underline-offset-2 hover:text-on-surface">
                            外す
                        </button>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPick(f);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
