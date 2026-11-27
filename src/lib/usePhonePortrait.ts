import { useSyncExternalStore } from "react";

function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const mq = window.matchMedia(query);
            mq.addEventListener("change", onChange);
            return () => mq.removeEventListener("change", onChange);
        },
        () => window.matchMedia(query).matches,
        () => false,
    );
}

// スマホの縦画面か。ドロワーを開いた間にページを傾ける動き（Header.tsx、globals.css の data-recede）の条件で、
// globals.css の @media と同じ値にしておく。
export function usePhonePortrait(): boolean {
    return useMediaQuery("(max-width: 639.98px) and (orientation: portrait)");
}

// ヘッダー右上の、ハンバーガーとモード切り替えを、1つのバーにする画面か。
// daidai横丁のメニューも、この画面では、そのバーの中へ入る。幅600px以上の縦長は、折りたたみ端末の側のメニュー（globals.css の fold）で、
// ヘッダーが出ないので、含めない
export function useHeaderBarMerged(): boolean {
    return useMediaQuery("(max-width: 599.98px) and (orientation: portrait)");
}

// daidai横丁のメニューを、ヘッダーのバーの中へ入れる場所の id
export const HEADER_BAR_SLOT_ID = "header-bar-slot";
