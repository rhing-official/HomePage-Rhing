import { useSyncExternalStore } from "react";

// スマホの縦画面か。ドロワーを開いた間にページを傾ける動き（Header.tsx、globals.css の data-recede）の条件で、
// globals.css の @media と同じ値にしておく。
const QUERY = "(max-width: 639.98px) and (orientation: portrait)";

function subscribe(onChange: () => void) {
    const mq = window.matchMedia(QUERY);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
}

export function usePhonePortrait(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
