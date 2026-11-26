"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileArchive, Palette, XCircle } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { auth, onAuthStateChanged, type User } from "@/lib/firebaseAuth";
import { submitThemePack } from "@/lib/firebaseFunctions";
import { uploadThemePackSubmission } from "@/lib/firebaseStorage";
import { validateThemePackZip, type ValidationResult } from "@/lib/themePack/validate";
import { COLOR_KEYS, COLOR_LABELS, THEME_PACK_LIMITS } from "@/lib/themePack/spec";
import { describeContrast, MIN_CONTRAST_RATIO } from "@/lib/themePack/contrast";
import { formatBytes } from "@/lib/themePack/zip";

const PAGE_PATH = "/daidai-yokocho/creator/themes/new";

// TODO: 権利の表明と、投稿の規約の文面は、仮のもの。専門家の確認が済んだら、公開の前に差し替える（2026-11-26、素材パックの方針）。
const RIGHTS_STATEMENT =
    "投稿する素材は、自分で作ったものであるか、投稿に必要な許諾を得たものです。素材の著作権は、投稿者が持ちます。DaiDaiには、配信と表示のための許諾だけを渡します。";

type Checked = { fileName: string; fileSize: number; result: ValidationResult };

export default function ThemePackSubmitForm() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [checking, setChecking] = useState(false);
    const [checked, setChecked] = useState<Checked | null>(null);
    const [dragging, setDragging] = useState(false);
    const [rights, setRights] = useState(false);
    const [terms, setTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
    }, [ready, user, router]);

    // 選んだzipを、その場で検査する。ファイルは、ブラウザの外へ送らない
    const check = useCallback(async (file: File) => {
        setChecking(true);
        setChecked(null);
        try {
            let result: ValidationResult;
            if (file.size > THEME_PACK_LIMITS.totalMaxBytes) {
                result = {
                    ok: false,
                    errors: [`zipの容量が大きすぎます。${formatBytes(THEME_PACK_LIMITS.totalMaxBytes)}以下にしてください。`],
                    warnings: [],
                    passed: [],
                };
            } else {
                result = validateThemePackZip(new Uint8Array(await file.arrayBuffer()));
            }
            setChecked({ fileName: file.name, fileSize: file.size, result });
        } catch {
            setChecked({
                fileName: file.name,
                fileSize: file.size,
                result: { ok: false, errors: ["検査中に、問題が起きました。ファイルを選び直してください。"], warnings: [], passed: [] },
            });
        } finally {
            setChecking(false);
        }
    }, []);

    if (!ready || !user) return null;

    const result = checked?.result;
    const canSubmit = !!result?.ok && !!result.files && rights && terms && !submitting && !submitted;

    // 検査に通った素材を、本人の保存先へ置き、提出する。サーバーが、もう一度検査する
    const submit = async () => {
        if (!canSubmit || !result?.files || !user) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const submissionId = crypto.randomUUID();
            await uploadThemePackSubmission(user.uid, submissionId, result.files);
            await submitThemePack({ submissionId, rightsAccepted: true });
            setSubmitted(true);
        } catch (err) {
            console.error("素材パックを送信できませんでした:", err);
            setSubmitError(
                err instanceof FirebaseError && err.code === "functions/resource-exhausted"
                    ? "投稿できる数の上限に達しています。"
                    : "送信できませんでした。時間をおいて、もう一度お試しください。",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full pb-24">
            <div className="container mx-auto px-6 pb-16 max-w-3xl">
                <div className="mb-10">
                    <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-bold tracking-widest text-gray-900">
                        <Palette className="w-7 h-7 shrink-0" aria-hidden />
                        素材パックを投稿する
                    </h1>
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                        素材パックのzipを選ぶと、ブラウザの中で、決まりに合っているかを確認します。選んだファイルは、ここでは送られません。
                    </p>
                </div>

                {/* ファイルの選択 */}
                <label
                    htmlFor="theme-pack-file"
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) void check(f);
                    }}
                    className={`flex flex-col items-start gap-3 rounded-m3-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                        dragging ? "border-primary bg-primary-container/40" : "border-gray-300 bg-white hover:border-primary/60"
                    }`}
                >
                    <span className="flex items-center gap-3 text-gray-900 font-bold">
                        <FileArchive className="w-6 h-6 text-primary" aria-hidden />
                        zipを選ぶ、またはここへドロップ
                    </span>
                    <span className="text-sm text-gray-500 leading-relaxed">
                        pack.jsonと画像を、zipの直下か、idと同じ名前のディレクトリの中に置いてください。画像は、png・webp・jpegで、1枚{formatBytes(THEME_PACK_LIMITS.imageMaxBytes)}以下、各辺{THEME_PACK_LIMITS.imageMaxSide}px以下です。zip全体は{formatBytes(THEME_PACK_LIMITS.totalMaxBytes)}以下にしてください。
                    </span>
                    <input
                        id="theme-pack-file"
                        ref={inputRef}
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed"
                        className="sr-only"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void check(f);
                            e.target.value = "";
                        }}
                    />
                </label>

                {checking && <p className="mt-6 text-sm text-gray-500">確認しています。</p>}

                {checked && result && (
                    <section className="mt-8 flex flex-col gap-6" aria-live="polite">
                        <div
                            className={`rounded-m3-lg border p-6 ${result.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                        >
                            <p className="flex items-center gap-3 font-bold text-gray-900">
                                {result.ok ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" aria-hidden />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600 shrink-0" aria-hidden />
                                )}
                                {result.ok ? "確認に通りました" : "直す所があります"}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 break-all">
                                {checked.fileName}（{formatBytes(checked.fileSize)}）
                            </p>
                        </div>

                        {result.errors.length > 0 && (
                            <ResultList title="直してください" tone="error" items={result.errors} />
                        )}
                        {result.warnings.length > 0 && (
                            <ResultList title="確認してください" tone="warning" items={result.warnings} />
                        )}
                        {result.passed.length > 0 && <ResultList title="確認できた項目" tone="ok" items={result.passed} />}

                        {result.pack && <ColorPreview result={result} />}
                    </section>
                )}

                {/* 権利の表明と、規約への同意 */}
                <section className="mt-10 flex flex-col gap-4 rounded-m3-lg bg-white border border-gray-100 shadow-sm p-6">
                    <h2 className="font-bold text-gray-900">投稿する前に</h2>
                    <label className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed cursor-pointer">
                        <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
                        <span>{RIGHTS_STATEMENT}</span>
                    </label>
                    <label className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed cursor-pointer">
                        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
                        <span>
                            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-gray-900" target="_blank">
                                利用規約
                            </Link>
                            に同意します。
                        </span>
                    </label>
                    <p className="text-xs text-gray-400 leading-relaxed">この文面は、仮のものです。公開の前に、専門家の確認を受けて差し替えます。</p>
                </section>

                <div className="mt-8 flex flex-col items-start gap-3">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit}
                        className="rounded-full bg-primary px-8 py-3 font-bold text-on-primary tracking-wide transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? "送信中…" : submitted ? "提出しました" : "投稿する"}
                    </button>
                    {submitted ? (
                        <p className="text-sm text-green-700 leading-relaxed">
                            提出しました。運営が審査し、結果はお知らせでお伝えします。
                        </p>
                    ) : submitError ? (
                        <p className="text-sm text-red-600 leading-relaxed">{submitError}</p>
                    ) : (
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {canSubmit
                                ? "確認と同意は、済んでいます。送ると、運営の審査に進みます。"
                                : "確認に通り、2つの同意にチェックを入れると、送れるようになります。"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResultList({ title, tone, items }: { title: string; tone: "error" | "warning" | "ok"; items: string[] }) {
    const Icon = tone === "error" ? XCircle : tone === "warning" ? AlertTriangle : CheckCircle2;
    const color = tone === "error" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-green-600";
    return (
        <div className="rounded-m3-lg bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">{title}</h2>
            <ul className="flex flex-col gap-3">
                {items.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <Icon className={`w-4 h-4 mt-1 shrink-0 ${color}`} aria-hidden />
                        <span>{t}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// 指定された色の見本と、文字の読みやすさ（コントラスト比）
function ColorPreview({ result }: { result: ValidationResult }) {
    const pack = result.pack!;
    const scopes: ("light" | "dark")[] = pack.brightness === "both" ? ["light", "dark"] : [pack.brightness];
    return (
        <div className="rounded-m3-lg bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">{pack.name}</h2>
            <p className="text-xs text-gray-500 mb-4">
                id: {pack.id}　対応する外観: {pack.brightness === "both" ? "明るい・暗いの両方" : pack.brightness === "light" ? "明るいだけ" : "暗いだけ"}
            </p>
            {scopes.map((scope) => {
                const colors = pack.colors[scope];
                const specified = COLOR_KEYS.filter((k) => colors[k]);
                const checks = result.contrast?.checks.filter((c) => c.scope === scope) ?? [];
                return (
                    <div key={scope} className="mb-5 last:mb-0">
                        <h3 className="text-sm font-bold text-gray-800 mb-2">{scope === "light" ? "明るい外観" : "暗い外観"}</h3>
                        {specified.length === 0 ? (
                            <p className="text-sm text-gray-500">色は書かれていません。アプリの標準の色になります。</p>
                        ) : (
                            <ul className="flex flex-wrap gap-3 mb-3">
                                {specified.map((k) => (
                                    <li key={k} className="flex items-center gap-2 text-xs text-gray-700">
                                        <span className="w-6 h-6 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: colors[k] }} aria-hidden />
                                        {COLOR_LABELS[k]} {colors[k]}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {checks.length > 0 && (
                            <ul className="flex flex-col gap-2">
                                {checks.map((c) => (
                                    <li key={`${c.fg}-${c.bg}`} className="flex items-center gap-3 text-sm">
                                        <span
                                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold"
                                            style={{ color: c.fgHex, backgroundColor: c.bgHex }}
                                        >
                                            Aa あ
                                        </span>
                                        <span className={c.pass ? "text-gray-700" : "text-red-600"}>
                                            {describeContrast(c)}。{c.pass ? "" : `基準は${MIN_CONTRAST_RATIO}以上です。`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
