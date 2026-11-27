"use client";

import { useEffect } from "react";
import ModalPortal from "@/components/ModalPortal";

// 取り消せない操作の前に出す、確認のポップアップ。実行ボタンは赤
export default function ConfirmDialog({
    title,
    message,
    confirmLabel,
    busyLabel,
    busy,
    error,
    onConfirm,
    onClose,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    busyLabel: string;
    busy: boolean;
    error: string | null;
    onConfirm: () => void;
    onClose: () => void;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [busy, onClose]);

    return (
        <ModalPortal>
            <div
                className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={() => !busy && onClose()}
            >
                <div
                    className="w-full max-w-md bg-surface-container-lowest rounded-m3-xl shadow-elevation-3 p-6 flex flex-col gap-4 text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-lg font-bold text-on-surface">{title}</h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
                    {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={busy} className="px-5 py-2 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50">
                            やめる
                        </button>
                        <button type="button" onClick={onConfirm} disabled={busy} className="px-5 py-2 rounded-full text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                            {busy ? busyLabel : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
