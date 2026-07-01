"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactForm() {
    const searchParams = useSearchParams();
    const typeQuery = searchParams.get("type");

    const [activeTab, setActiveTab] = useState<"user" | "business">(typeQuery === "business" ? "business" : "user");

    // 🌟 送信ステータスを管理する状態を追加します
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    useEffect(() => {
        if (typeQuery === "business") setActiveTab("business");
        if (typeQuery === "user") setActiveTab("user");
    }, [typeQuery]);

    // 🌟 GASへ非同期でデータを送信するハンドラー
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("submitting");

        const formData = new FormData(e.currentTarget);

        // ハニーポット（botcheck）が埋まっている場合は、スパムボット対策として送信成功を装い中断します
        if (formData.get("botcheck")) {
            setStatus("success");
            return;
        }

        // GASへの送信パラメータを作成
        const searchParams = new URLSearchParams();
        formData.forEach((value, key) => {
            searchParams.append(key, value.toString());
        });
        searchParams.append("activeTab", activeTab); // アクティブなタブ（user/business）も追加

        try {
            // 🌟 先ほどコピーしたGASのウェブアプリURLをここに貼り付けてください
            const GAS_URL = "https://script.google.com/macros/s/AKfycbxWxNCo2T3awUeDQ4WIAu1wa_IWgrl9MmNHooH3MLKmraQOrhiCBvW8_9AbdmaNI6iU/exec";

            /* 
              💡 GASとの通信時の注意点：
              GASはリダイレクトを伴うため、ブラウザによっては「CORSエラー」がコンソールに表示されることがあります。
              これを最も安全・確実に回避するため、`mode: "no-cors"` でリクエストを送信します。
              `no-cors` の場合レスポンスの中身は空になりますが、例外が発生しなければ送信成功と判断できます。
            */
            await fetch(GAS_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: searchParams.toString(),
            });

            setStatus("success");
        } catch (error) {
            console.error("送信エラー:", error);
            setStatus("error");
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-3xl">

            {/* タブ切り替えボタン */}
            <div className="flex justify-center gap-12 border-b border-gray-200 mb-12">
                <button
                    disabled={status === "submitting"}
                    onClick={() => setActiveTab("user")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "user" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
                        } disabled:opacity-50`}
                >
                    ユーザー向け
                </button>
                <button
                    disabled={status === "submitting"}
                    onClick={() => setActiveTab("business")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "business" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
                        } disabled:opacity-50`}
                >
                    企業向け
                </button>
            </div>

            {/* 送信状態に応じた表示の切り替え */}
            <AnimatePresence mode="wait">
                {status === "success" ? (
                    // 送信成功画面
                    <motion.div
                        key="success-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm"
                    >
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-wider">送信が完了しました</h2>
                        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
                            お問い合わせいただきありがとうございます。内容を確認の上、代表より折り返しご連絡いたします。
                        </p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="mt-8 px-8 py-3 bg-[#111] hover:bg-gray-800 text-white font-bold rounded-full text-sm transition-colors tracking-widest"
                        >
                            戻る
                        </button>
                    </motion.div>
                ) : (
                    // フォーム入力画面
                    <motion.form
                        key="contact-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100"
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
                                        <input type="text" id="company" name="貴社名" required={activeTab === "business"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：株式会社Rhing" />
                                    </div>

                                    {/* ご担当者名（企業向けでのみ表示） */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                            ご担当者名 <span className="text-red-500 ml-1 text-xs font-normal">必須</span>
                                        </label>
                                        <input type="text" id="name" name="ご担当者名" required={activeTab === "business"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：山田 太郎" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 共通項目：メールアドレス */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">メールアドレス <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <input type="email" id="email" name="メールアドレス" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="例：your-email@example.com" />
                        </div>

                        {/* お問い合わせ種別 */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">お問い合わせ種別 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <select id="category" name="お問い合わせ種別" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors appearance-none cursor-pointer">
                                <option value="">選択してください</option>
                                {activeTab === "user" ? (
                                    <>
                                        <option value="サービスの使い方について">サービスの使い方について</option>
                                        <option value="不具合の報告">不具合の報告</option>
                                        <option value="ご意見・ご要望">ご意見・ご要望</option>
                                        <option value="その他">その他</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="協業・提携について">協業・提携について</option>
                                        <option value="取材・メディア掲載について">取材・メディア掲載について</option>
                                        <option value="その他">その他</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* 共通項目：お問い合わせ内容 */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">お問い合わせ内容 <span className="text-red-500 ml-1 text-xs font-normal">必須</span></label>
                            <textarea id="message" name="お問い合わせ内容" required rows={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none" placeholder="お問い合わせ内容をご記入ください。"></textarea>
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
                                className="w-full md:w-auto px-12 py-4 bg-[#111] hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold rounded-full transition-colors tracking-widest disabled:cursor-not-allowed"
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