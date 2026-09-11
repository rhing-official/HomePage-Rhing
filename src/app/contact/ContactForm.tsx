"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { uploadContactAttachment } from "@/lib/firebaseStorage";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

// window.grecaptcha.ready()のコールバックが実行される前にexecute()を呼ぶと
// 失敗するため、readyを挟んでからexecuteする。
async function getRecaptchaToken(): Promise<string> {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) {
        throw new Error("reCAPTCHAが読み込まれていません");
    }
    const grecaptcha = window.grecaptcha;
    return new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" }).then(resolve, reject);
        });
    });
}

export default function ContactForm() {
    const searchParams = useSearchParams();
    const typeQuery = searchParams.get("type");

    // 🌟 修正ポイント: 欠落していた activeTab の状態（State）定義を追加します
    const [activeTab, setActiveTab] = useState<"user" | "business">(typeQuery === "business" ? "business" : "user");

    // 送信ステータスを管理する状態
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    // 添付画像（貼り付け・ファイル選択・ドラッグ&ドロップの3方式に対応）
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeQuery === "business") setActiveTab("business");
        if (typeQuery === "user") setActiveTab("user");
    }, [typeQuery]);

    const previewUrls = useMemo(() => attachments.map((file) => URL.createObjectURL(file)), [attachments]);
    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    // ファイル選択・ドラッグ&ドロップ・クリップボード貼り付けの3方式共通の追加処理
    const addAttachments = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        if (imageFiles.length === 0) {
            setAttachmentError("画像ファイルのみ添付できます。");
            return;
        }
        const oversized = imageFiles.some((file) => file.size > MAX_ATTACHMENT_SIZE);
        if (oversized) {
            setAttachmentError("添付できる画像は1枚あたり5MBまでです。");
            return;
        }
        setAttachments((prev) => {
            const next = [...prev, ...imageFiles].slice(0, MAX_ATTACHMENTS);
            if (prev.length + imageFiles.length > MAX_ATTACHMENTS) {
                setAttachmentError(`添付できる画像は最大${MAX_ATTACHMENTS}枚までです。`);
            } else {
                setAttachmentError(null);
            }
            return next;
        });
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        setAttachmentError(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        addAttachments(Array.from(e.dataTransfer.files));
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
        const files = Array.from(e.clipboardData.items)
            .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);
        if (files.length > 0) addAttachments(files);
    };

    // GASへ非同期でデータを送信するハンドラー
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("submitting");

        const formData = new FormData(e.currentTarget);

        // ハニーポット（botcheck）が埋まっている場合は、スパムボット対策として送信成功を装い中断します
        if (formData.get("botcheck")) {
            setStatus("success");
            return;
        }

        const fields: Record<string, string> = {};
        formData.forEach((value, key) => {
            if (key !== "botcheck") fields[key] = value.toString();
        });

        try {
            const attachmentUrls = await Promise.all(attachments.map((file) => uploadContactAttachment(file)));
            const recaptchaToken = await getRecaptchaToken();

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    activeTab,
                    fields,
                    attachmentUrls,
                    recaptchaToken,
                    botcheck: "",
                }),
            });
            const data = (await res.json()) as { success: boolean };

            if (res.ok && data.success) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error("送信エラー:", error);
            setStatus("error");
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-3xl">
            {RECAPTCHA_SITE_KEY && (
                <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
            )}

            {/* タブ切り替えボタン */}
            <div className="flex justify-center gap-12 border-b border-gray-200 mb-12">
                <button
                    disabled={status === "submitting"}
                    onClick={() => setActiveTab("user")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "user" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-600"
                        } disabled:opacity-50`}
                >
                    ユーザー向け
                </button>
                <button
                    disabled={status === "submitting"}
                    onClick={() => setActiveTab("business")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "business" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-600"
                        } disabled:opacity-50`}
                >
                    企業向け
                </button>
            </div>

            {/* 送信状態に応じた表示の切り替え */}
            <AnimatePresence mode="wait">
                {status === "success" ? (
                    /* 送信成功画面（ガラス風カード） */
                    <motion.div
                        key="success-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-16 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/30 rounded-2xl p-8 md:p-12"
                    >
                        <div className="w-16 h-16 bg-green-50/80 border border-green-200/40 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-wider">送信が完了しました</h2>
                        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
                            お問い合わせいただきありがとうございます。内容を確認の上、代表より折り返しご連絡いたします。
                        </p>
                        <button
                            onClick={() => {
                                setStatus("idle");
                                setAttachments([]);
                            }}
                            className="mt-8 px-8 py-3 bg-[#111] hover:bg-gray-800 text-white font-bold rounded-full text-sm transition-colors tracking-widest"
                        >
                            戻る
                        </button>
                    </motion.div>
                ) : (
                    /* フォーム本体（ガラス風カード） */
                    <motion.form
                        key="contact-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        onPaste={handlePaste}
                        className="space-y-8 bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/80 shadow-md shadow-gray-200/30"
                    >
                        <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                        {/* === 企業向けの場合のみ「貴社名」と「ご担当者名」を表示 === */}
                        <AnimatePresence mode="wait">
                            {activeTab === "business" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-8 overflow-hidden"
                                >
                                    {/* 貴社名 */}
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-bold text-gray-700 mb-2">貴社名 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                                        <input type="text" id="company" name="貴社名" required={activeTab === "business"} className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all" placeholder="例：株式会社Rhing" />
                                    </div>

                                    {/* ご担当者名（企業向けでのみ表示） */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                            ご担当者名 <span className="text-red-500 ml-1 text-xs font-normal">必須</span>
                                        </label>
                                        <input type="text" id="name" name="ご担当者名" required={activeTab === "business"} className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all" placeholder="例：山田 太郎" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 共通項目：メールアドレス */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">メールアドレス <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <input type="email" id="email" name="メールアドレス" required className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all" placeholder="例：your-email@example.com" />
                        </div>

                        {/* お問い合わせ種別 */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">お問い合わせ種別 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <select id="category" name="お問い合わせ種別" required className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all appearance-none cursor-pointer">
                                <option value="" className="text-gray-900 bg-white">選択してください</option>
                                {activeTab === "user" ? (
                                    <>
                                        <option value="サービスの使い方について" className="text-gray-900 bg-white">サービスの使い方について</option>
                                        <option value="不具合の報告" className="text-gray-900 bg-white">不具合 of 報告</option>
                                        <option value="ご意見・ご要望" className="text-gray-900 bg-white">ご意見・ご要望</option>
                                        <option value="その他" className="text-gray-900 bg-white">その他</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="協業・提携について" className="text-gray-900 bg-white">協業・提携について</option>
                                        <option value="取材・メディア掲載について" className="text-gray-900 bg-white">取材・メディア掲載について</option>
                                        <option value="その他" className="text-gray-900 bg-white">その他</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* 共通項目：お問い合わせ内容 */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">お問い合わせ内容 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <textarea id="message" name="お問い合わせ内容" required rows={6} className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all resize-none" placeholder="お問い合わせ内容をご記入ください。"></textarea>
                        </div>

                        {/* 画像添付：ファイル選択・ドラッグ&ドロップ・クリップボード貼り付け(Ctrl+V)に対応 */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                画像を添付 <span className="text-gray-400 ml-1 text-xs font-normal">任意・最大{MAX_ATTACHMENTS}枚、各5MBまで</span>
                            </label>
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-gray-300/80 rounded-lg p-6 text-center bg-white/30 hover:bg-white/50 transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) addAttachments(Array.from(e.target.files));
                                        e.target.value = "";
                                    }}
                                />
                                <p className="text-sm text-gray-500 mb-3">
                                    画像をここにドラッグ&ドロップ、またはコピーした画像をこのフォーム内で貼り付け(Ctrl+V)できます。
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    画像を選択
                                </button>
                            </div>

                            {attachmentError && (
                                <p className="text-red-500 text-xs mt-2">{attachmentError}</p>
                            )}

                            {previewUrls.length > 0 && (
                                <div className="flex gap-3 mt-4 flex-wrap">
                                    {previewUrls.map((url, index) => (
                                        <div key={url} className="relative w-20 h-20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/80" />
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-gray-600"
                                                aria-label="添付を削除"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 送信状況に応じたエラーメッセージ */}
                        {status === "error" && (
                            <p className="text-red-500 text-sm font-bold text-center">
                                送信中にエラーが発生しました。お手数ですが、時間をおいて再度お試しください。
                            </p>
                        )}

                        {/* 送信ボタン */}
                        <div className="pt-6 text-center">
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="w-full md:w-auto px-12 py-4 bg-[#111] hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-full transition-colors tracking-widest disabled:cursor-not-allowed shadow-md"
                            >
                                {status === "submitting" ? "送信中..." : "送信する"}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
