"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

// ダイアログを、ページの外（document.body直下）に描画する。ページ本体（template.tsxの
// .page-blur-in）は、isolationで独立した重なりの層になっていて、その中のposition: fixedの
// ダイアログは、後ろにあるフッターより奥に入り込んでしまう（2026-11-17、管理画面の
// プロフィール編集で発生）。body直下に出すと、フッターより前面に出る。
export default function ModalPortal({ children }: { children: React.ReactNode }) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);
    return mounted ? createPortal(children, document.body) : null;
}
