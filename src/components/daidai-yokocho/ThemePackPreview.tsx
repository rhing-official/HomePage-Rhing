"use client";

import { COLOR_KEYS, COLOR_LABELS } from "@/lib/themePack/spec";
import { describeContrast, MIN_CONTRAST_RATIO } from "@/lib/themePack/contrast";
import type { ThemePackPreviewData } from "@/lib/themePackReview";

// 審査用のプレビュー。版画の見た目に近い形で、背景・パネル・吹き出し・ボタンを並べる。
// 色の指定が無い所は、アプリが版画の標準で導くため、ここでは灰色の見本にする。
const FALLBACK = { background: "#f5f5f5", panel: "#ffffff", text: "#222222", accent: "#888888", onAccent: "#ffffff", line: "#444444" };

export default function ThemePackPreview({ data }: { data: ThemePackPreviewData }) {
    const { pack, contrast, backgroundUrl } = data;
    const scopes: ("light" | "dark")[] = pack.brightness === "both" ? ["light", "dark"] : [pack.brightness];
    const { borderWidth, radius, shadowOffset } = pack.shape;
    return (
        <div className="flex flex-col gap-5">
            <p className="text-xs text-gray-500">
                id: {pack.id}　作者の表示: {pack.author || "（無し）"}　外観: {pack.brightness === "both" ? "明るい・暗い" : pack.brightness === "light" ? "明るい" : "暗い"}
                　線の太さ {borderWidth}、角の丸み {radius}、影 {shadowOffset[0]}・{shadowOffset[1]}
            </p>
            {data.warnings.length > 0 && (
                <ul className="text-xs text-amber-700 list-disc pl-5">
                    {data.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                    ))}
                </ul>
            )}
            {scopes.map((scope) => {
                const c = { ...FALLBACK, ...pack.colors[scope] };
                const checks = contrast.checks.filter((k) => k.scope === scope);
                const skipped = contrast.skipped.filter((k) => k.scope === scope);
                const boxStyle = {
                    border: `${borderWidth}px solid ${c.line}`,
                    borderRadius: radius,
                    boxShadow: `${shadowOffset[0]}px ${shadowOffset[1]}px 0 ${c.line}`,
                };
                return (
                    <div key={scope} className="flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-gray-800">{scope === "light" ? "明るい外観" : "暗い外観"}</h4>
                        <div
                            className="p-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-cover bg-center"
                            style={{
                                backgroundColor: c.background,
                                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                            }}
                        >
                            <div className="p-4 text-sm" style={{ ...boxStyle, backgroundColor: c.panel, color: c.text }}>
                                パネルの上の文字です。読みやすいか確認してください。
                            </div>
                            <div className="p-3 text-sm self-start max-w-[80%]" style={{ ...boxStyle, backgroundColor: c.background, color: c.text }}>
                                背景の上の文字です。
                            </div>
                            <button
                                type="button"
                                tabIndex={-1}
                                className="self-end px-5 py-2 text-sm font-bold"
                                style={{ ...boxStyle, backgroundColor: c.accent, color: c.onAccent }}
                            >
                                ボタン
                            </button>
                        </div>
                        <ul className="flex flex-wrap gap-3">
                            {COLOR_KEYS.filter((k) => pack.colors[scope][k]).map((k) => (
                                <li key={k} className="flex items-center gap-2 text-xs text-gray-700">
                                    <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: pack.colors[scope][k] }} aria-hidden />
                                    {COLOR_LABELS[k]} {pack.colors[scope][k]}
                                </li>
                            ))}
                        </ul>
                        <ul className="flex flex-col gap-1">
                            {checks.map((k) => (
                                <li key={`${k.fg}-${k.bg}`} className={`text-xs ${k.pass ? "text-gray-600" : "text-red-600 font-bold"}`}>
                                    {describeContrast(k)}。{k.pass ? "" : `基準は${MIN_CONTRAST_RATIO}以上です。`}
                                </li>
                            ))}
                            {skipped.length > 0 && <li className="text-xs text-gray-400">色の指定が足りない組は、確認していません。</li>}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
