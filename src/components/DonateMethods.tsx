"use client";

import { useState } from "react";

// Stripe の決済リンク（寄付者が金額を入力して支払う。クレジットカード・デビットカード、PayPay有効化後はPayPayも）
const STRIPE_DONATION_URL = "https://buy.stripe.com/8x28wO3FHaw54v0f6p1Jm01";
// NOWPayments の寄付ページ（寄付者が金額を入力して支払う）
const BITCOIN_DONATION_URL = "https://nowpayments.io/donation/rhing";

type Method = { id: string; name: string; available: boolean; panel: "stripe" | "bitcoin" };

const methods: Method[] = [
    { id: "credit", name: "クレジットカード", available: true, panel: "stripe" },
    { id: "debit", name: "デビットカード", available: true, panel: "stripe" },
    // PayPayは、Stripeでの有効化（審査）が完了したら available を true にする
    { id: "paypay", name: "PayPay", available: false, panel: "stripe" },
    { id: "bitcoin", name: "ビットコイン", available: true, panel: "bitcoin" },
];

export default function DonateMethods() {
    const [selected, setSelected] = useState<string | null>(null);
    const selectedPanel = methods.find((m) => m.id === selected)?.panel ?? null;

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {methods.map((m) => {
                    const isSelected = selected === m.id;
                    if (!m.available) {
                        return (
                            <div
                                key={m.id}
                                className="border border-gray-300 text-gray-400 rounded-2xl p-6 text-center"
                            >
                                <p className="font-bold tracking-wide mb-1">{m.name}</p>
                                <p className="text-xs tracking-widest">準備中</p>
                            </div>
                        );
                    }
                    return (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelected(isSelected ? null : m.id)}
                            aria-pressed={isSelected}
                            className={`rounded-2xl p-6 text-center font-bold tracking-wide transition-colors ${
                                isSelected
                                    ? "bg-gray-900 text-white"
                                    : "bg-white/60 border border-gray-900 text-gray-900 hover:bg-white"
                            }`}
                        >
                            <p className="mb-1">{m.name}</p>
                            <p className="text-xs tracking-widest font-normal">受付中</p>
                        </button>
                    );
                })}
            </div>

            {selectedPanel === "stripe" && (
                <div className="mt-8 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 md:p-10">
                    <h3 className="text-lg font-bold text-gray-900 tracking-wider mb-4">カードで寄付する</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed mb-8">
                        <li>クレジットカード・デビットカードを、同じ決済画面でお使いいただけます。</li>
                        <li>金額は、決済画面で自由に入力できます（50円以上）。</li>
                        <li>お支払い後の返金はできません。</li>
                        <li>決済は、Stripe の決済画面（外部サイト）で行います。</li>
                        <li>お支払い額の1%は、Rhingが Stripe Climate を通じて、CO₂ の除去に寄付します（追加の負担はありません）。</li>
                    </ul>
                    <a
                        href={STRIPE_DONATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full sm:w-auto sm:inline-block text-center rounded-full bg-gray-900 text-white px-10 py-3 text-sm font-bold tracking-wider hover:bg-gray-700 transition-colors"
                    >
                        決済画面へ進む
                    </a>
                </div>
            )}

            {selectedPanel === "bitcoin" && (
                <div className="mt-8 bg-white/40 backdrop-blur-md border border-white/80 shadow-md shadow-gray-200/20 rounded-3xl p-8 md:p-10">
                    <h3 className="text-lg font-bold text-gray-900 tracking-wider mb-4">ビットコインで寄付する</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed mb-8">
                        <li>金額は、寄付ページで自由に入力できます。</li>
                        <li>ネットワーク手数料の都合で、最低額があります。目安は約0.0002625BTC です。</li>
                        <li>ネットワーク手数料は、お支払いになる方の負担です。価格変動があり、お支払い後の返金はできません。</li>
                        <li>決済は、NOWPayments の寄付ページ（外部サイト）で行います。</li>
                    </ul>
                    <a
                        href={BITCOIN_DONATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full sm:w-auto sm:inline-block text-center rounded-full bg-gray-900 text-white px-10 py-3 text-sm font-bold tracking-wider hover:bg-gray-700 transition-colors"
                    >
                        寄付ページへ進む
                    </a>
                </div>
            )}
        </div>
    );
}
