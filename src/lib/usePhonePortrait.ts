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

// ヘッダー右上の、ハンバーガーとモード切り替えのバーが、今、画面に出ているか。
// daidai横丁のメニューは、出ている間、そのバーの中へ入る。幅や縦横の条件は、ここには書かず、場所そのものが見えているかで決める。
// そのため、幅1500px以上（PC用のナビバー）や、折りたたみ端末のサイドメニュー（ヘッダーごと隠れる）の時は、自然に、入らなくなる
export function useHeaderBarMerged(slot: HTMLElement | null): boolean {
    return useSyncExternalStore(
        (onChange) => {
            window.addEventListener("resize", onChange);
            window.addEventListener("orientationchange", onChange);
            return () => {
                window.removeEventListener("resize", onChange);
                window.removeEventListener("orientationchange", onChange);
            };
        },
        () => !!slot && slot.getClientRects().length > 0,
        () => false,
    );
}

// daidai横丁のメニューを、ヘッダーのバーの中へ入れる場所の id
export const HEADER_BAR_SLOT_ID = "header-bar-slot";
