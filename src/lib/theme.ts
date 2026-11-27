// 表示のテーマ（システムに合わせる・ライト・ダーク）。選んだ値は、このブラウザのlocalStorageに保存する。
// 描画の前に`<html>`へ`dark`を付ける処理は、layout.tsxのTHEME_INIT_SCRIPTが行う（ちらつきを避けるため）。

export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "rhing-theme";

/** layout.tsxの`<head>`に、そのまま埋め込む。保存済みの設定かOSの設定から、`dark`クラスと`color-scheme`を付ける */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||((p===null||p==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;if(d){e.classList.add("dark");e.style.colorScheme="dark"}else{e.classList.remove("dark");e.style.colorScheme="light"}}catch(_){}})()`;

function isPreference(v: unknown): v is ThemePreference {
    return v === "system" || v === "light" || v === "dark";
}

export function readPreference(): ThemePreference {
    try {
        const v = localStorage.getItem(THEME_STORAGE_KEY);
        return isPreference(v) ? v : "system";
    } catch {
        return "system";
    }
}

export function resolveDark(pref: ThemePreference): boolean {
    return pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(pref: ThemePreference): void {
    const dark = resolveDark(pref);
    const el = document.documentElement;
    el.classList.toggle("dark", dark);
    el.style.colorScheme = dark ? "dark" : "light";
}

const listeners = new Set<() => void>();

export function setPreference(pref: ThemePreference): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
        // 保存できなくても、この表示には反映する
    }
    const apply = () => {
        applyTheme(pref);
        listeners.forEach((l) => l());
    };
    // 切り替えの瞬間に、古い見た目が、にじんで消え、新しい見た目が、にじんで現れる（globals.cssの::view-transition-*）。
    // View Transitions APIに対応していないブラウザでは、その場で切り替える。
    // 動きを減らす設定（prefers-reduced-motion）は、見ない（2026-11-28、ユーザー指示。サイト内のアニメーションは、端末の設定に関わらず、全て実行する）。
    if (typeof document.startViewTransition === "function") {
        document.startViewTransition(apply);
    } else {
        apply();
    }
}

/** useSyncExternalStore用。他のタブでの変更と、OSの設定の変更（システムに合わせる時だけ）も拾う */
export function subscribeTheme(listener: () => void): () => void {
    listeners.add(listener);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => {
        if (readPreference() === "system") applyTheme("system");
        listener();
    };
    const onStorage = (e: StorageEvent) => {
        if (e.key === THEME_STORAGE_KEY) {
            applyTheme(readPreference());
            listener();
        }
    };
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        media.removeEventListener("change", onMedia);
        window.removeEventListener("storage", onStorage);
    };
}

export function getServerPreference(): ThemePreference {
    return "system";
}
