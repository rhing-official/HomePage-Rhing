"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
// 🌟 詰まっていた間隔のアニメーション用にframer-motionを正しく読み込みます
import { motion, AnimatePresence } from "framer-motion";

export default function ContactForm() {
    const searchParams = useSearchParams();
    const typeQuery = searchParams.get("type");

    const [activeTab, setActiveTab] = useState<"user" | "business">(typeQuery === "business" ? "business" : "user");

    useEffect(() => {
        if (typeQuery === "business") setActiveTab("business");
        if (typeQuery === "user") setActiveTab("user");
    }, [typeQuery]);

    return (
        <div className="container mx-auto px-6 max-w-3xl">

            {/* 🌟 タブ切り替えボタン：gap-8を追加して距離を取り、中央寄せにしました */}
            <div className="flex justify-center gap-12 border-b border-gray-200 mb-12">
                <button
                    onClick={() => setActiveTab("user")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "user" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    ユーザー向け
                </button>
                <button
                    onClick={() => setActiveTab("business")}
                    className={`px-8 py-4 text-center font-bold tracking-widest transition-colors ${activeTab === "business" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    企業向け
                </button>
            </div>

            {/* フォーム本体 */}
            <form action="https://api.web3forms.com/submit" method="POST" className="space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">

                {/* 🌟 アクセスキーを入れてください */}
                <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                <input type="hidden" name="subject" value={`【お問い合わせ】${activeTab === "user" ? "ユーザー様より" : "企業様より"}`} />
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                {/* === 企業向けの場合のみ「貴社名」と「ご担当者名」を表示 === */}
                <AnimatePresence mode="wait">
                    {activeTab === "business" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-8 overflow-hidden" // 🌟 ここで下の項目との等間隔(space-y-8)を確保しています
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

                {/* 送信ボタン */}
                <div className="pt-6 text-center">
                    <button type="submit" className="w-full md:w-auto px-12 py-4 bg-[#111] hover:bg-gray-800 text-white font-bold rounded-full transition-colors tracking-widest">
                        送信する
                    </button>
                </div>
            </form>
        </div>
    );
}