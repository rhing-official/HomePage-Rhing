"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import {
    APP_PLATFORMS,
    APP_PRICING,
    WEB_PRICING,
    estimateApp,
    estimateWeb,
    formatYen,
    type AppPlatform,
    type Estimate,
} from "@/lib/contractEstimate";

const cardClass = "bg-white/40 backdrop-blur-md border border-white/80 shadow-elevation-1 rounded-m3-xl";

function Stepper({ value, min, max, onChange, unit }: { value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
    const button = "w-9 h-9 rounded-full border border-primary/50 text-primary flex items-center justify-center hover:bg-primary-container/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";
    return (
        <div className="inline-flex items-center gap-4">
            <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="減らす">
                <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-bold text-gray-900 tabular-nums min-w-[4.5rem] text-center">
                {value}
                <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>
            </span>
            <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="増やす">
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}

function Check({ checked, onChange, disabled, label, hint }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; hint: string }) {
    return (
        <label className={`flex items-start gap-3 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
            <input
                type="checkbox"
                checked={checked && !disabled}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
            />
            <span>
                <span className="block font-bold text-gray-900">{label}</span>
                <span className="block text-sm text-gray-600 leading-relaxed">{hint}</span>
            </span>
        </label>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="py-6 border-b border-gray-200 last:border-b-0">
            <h3 className="text-sm font-bold tracking-widest text-gray-500 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function Result({ estimate, summary }: { estimate: Estimate; summary: string }) {
    const message = `【自動見積もり（目安）】\n${summary}\n合計の目安: ${formatYen(estimate.total)}${estimate.lines.length > 0 ? "〜" : ""}\n制作期間の目安: ${estimate.days}日\n\n（ご相談内容をご記入ください）`;
    return (
        <div className={`${cardClass} p-8 lg:sticky lg:top-28`}>
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">ESTIMATE</p>
            <p className="text-sm text-gray-600">合計の目安</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">
                {formatYen(estimate.total)}
                <span className="text-lg font-medium text-gray-500">〜</span>
            </p>
            <p className="text-sm text-gray-600 mt-3">制作期間の目安: <span className="font-bold text-gray-900">{estimate.days}日</span></p>

            <dl className="mt-6 text-sm border-t border-gray-200">
                {estimate.lines.map((line) => (
                    <div key={line.label} className="flex justify-between gap-4 py-2.5 border-b border-gray-100">
                        <dt className="text-gray-600">{line.label}</dt>
                        <dd className="text-gray-900 tabular-nums shrink-0">{formatYen(line.amount)}</dd>
                    </div>
                ))}
            </dl>

            {estimate.notes.length > 0 && (
                <ul className="mt-4 text-sm text-gray-700 space-y-1 list-disc pl-5">
                    {estimate.notes.map((note) => (
                        <li key={note}>{note}</li>
                    ))}
                </ul>
            )}

            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                自動の見積もりは目安です。正式なお見積もりは、ご依頼の内容を伺ってからお出しします。
            </p>

            <Link
                href={`/contact?type=business&message=${encodeURIComponent(message)}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold tracking-wider hover:bg-primary/90 hover:shadow-elevation-2 transition-all"
            >
                この内容でご相談する
                <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
    );
}

function WebSimulator() {
    const [pages, setPages] = useState(4);
    const [branchingForm, setBranchingForm] = useState(false);
    const [membership, setMembership] = useState(false);
    const estimate = estimateWeb({ pages, branchingForm, membership });
    const summary = `ホームページ制作 / ${pages}ページ${branchingForm ? " / 条件分岐フォームあり" : ""}${membership ? " / 会員機能あり" : ""}`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 items-start">
            <div className={`${cardClass} px-8`}>
                <Section title="ページ数">
                    <Stepper value={pages} min={1} max={WEB_PRICING.maxPages + 1} onChange={setPages} unit="ページ" />
                    <p className="text-xs text-gray-500 mt-3">
                        4ページまでは同額です（1ページのみは、さらにお安くなります）。5ページ以上は、1ページごとに{formatYen(WEB_PRICING.extraPage.price)}です。
                    </p>
                </Section>
                <Section title="機能">
                    <Check
                        checked={branchingForm}
                        onChange={setBranchingForm}
                        label="条件分岐フォーム"
                        hint="ご用件に応じて項目が切り替わり、メールの件名・本文も自動で整います。基本のお問い合わせフォームは、標準で含まれます。"
                    />
                    <div className="mt-4">
                        <Check
                            checked={membership}
                            onChange={setMembership}
                            label="会員機能"
                            hint={`会員登録・ログインと、会員だけに見せるページを付けます（+${formatYen(WEB_PRICING.membership.price)}、制作期間 +${WEB_PRICING.membership.days}日）。Firebaseの無料枠で運用し、維持費はドメイン代のままです。`}
                        />
                    </div>
                </Section>
                <Section title="全プランに含まれるもの">
                    <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                        <li>SEOの基本対策（タイトル・メタディスクリプション・見出し構造・画像のalt属性）</li>
                        <li>無料の修正3回</li>
                        <li>スマホ・タブレット・PCに合わせた表示</li>
                    </ul>
                </Section>
            </div>
            <Result estimate={estimate} summary={summary} />
        </div>
    );
}

function AppSimulator() {
    const [platforms, setPlatforms] = useState<AppPlatform[]>(["web"]);
    const [screens, setScreens] = useState(3);
    const [storeSupport, setStoreSupport] = useState(false);
    const [membership, setMembership] = useState(false);
    const estimate = estimateApp({ platforms, screens, storeSupport, membership });
    const hasAndroid = platforms.includes("android");
    const platformLabels = APP_PLATFORMS.filter((p) => platforms.includes(p.id)).map((p) => p.label);
    const summary = `アプリ制作 / 動作環境: ${platformLabels.length > 0 ? platformLabels.join("・") : "未選択"} / ${screens}画面${storeSupport && hasAndroid ? " / ストア公開サポートあり" : ""}${membership || hasAndroid ? " / 会員機能（ログイン・データ保存）あり" : ""}`;

    const toggle = (id: AppPlatform) =>
        setPlatforms((current) => (current.includes(id) ? current.filter((p) => p !== id) : [...current, id]));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 items-start">
            <div className={`${cardClass} px-8`}>
                <Section title="動作環境">
                    <div role="group" aria-label="動作環境" className="flex flex-wrap gap-2">
                        {APP_PLATFORMS.map((p) => {
                            const selected = platforms.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => toggle(p.id)}
                                    className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
                                        selected
                                            ? "border-primary bg-primary-container text-on-primary-container"
                                            : "border-gray-300 bg-white/50 text-gray-600 hover:bg-primary-container/40"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        複数選べます。Webのみは画面{APP_PRICING.web.includedScreens}つまで、Androidを含むと画面{APP_PRICING.webAndroid.includedScreens}つまで（ログインとデータ保存を含みます）。
                        iOS・macOS・Windows・Linuxは、別途お見積もりです。
                    </p>
                </Section>
                <Section title="画面の数">
                    <Stepper value={screens} min={1} max={APP_PRICING.maxScreens + 1} onChange={setScreens} unit="画面" />
                    <p className="text-xs text-gray-500 mt-3">
                        含まれる画面数を超えた分は、1画面ごとに{formatYen(APP_PRICING.extraScreen.price)}です。
                    </p>
                </Section>
                <Section title="オプション">
                    <div className="space-y-4">
                    <Check
                        checked={membership || hasAndroid}
                        onChange={setMembership}
                        disabled={hasAndroid}
                        label="会員機能（ログイン・データ保存）"
                        hint={hasAndroid ? "Androidを選ぶと、最初から含まれます。" : `会員登録・ログインと、データの保存を付けます（+${formatYen(APP_PRICING.membership.price)}、制作期間 +${APP_PRICING.membership.days}日）。Firebaseの無料枠で運用します。Webのみのときは、データは端末内に保存されます。`}
                    />
                    <Check
                        checked={storeSupport}
                        onChange={setStoreSupport}
                        disabled={!hasAndroid}
                        label="ストア公開サポート"
                        hint={`Google Playへの公開作業をお手伝いします（+${formatYen(APP_PRICING.storeSupport)}）。Androidを選ぶと選べます。審査の通過は保証できません。`}
                    />
                    </div>
                </Section>
            </div>
            <Result estimate={estimate} summary={summary} />
        </div>
    );
}

export default function EstimateSimulator({ kind }: { kind: "web" | "app" }) {
    return kind === "web" ? <WebSimulator /> : <AppSimulator />;
}
