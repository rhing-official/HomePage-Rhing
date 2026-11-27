import { useSyncExternalStore } from "react";

// メニューのチップ（お気に入り・カート）の件数の表示。
// 追加すると、件数の実数は、書き込みの直後に増えるが、表示は、点がチップに着くまで、増やさずに止めておく（freezeChipCount）。
// 点が着いた時（または、点を飛ばさないと決まった時）に、止めたものを解く。

export type ChipTarget = "favorite" | "cart";

type State = { real: number; frozen: number | null; holds: number };
const state: Record<ChipTarget, State> = {
    favorite: { real: 0, frozen: null, holds: 0 },
    cart: { real: 0, frozen: null, holds: 0 },
};
let shown: Record<ChipTarget, number> = { favorite: 0, cart: 0 };
const listeners = new Set<() => void>();

function recompute() {
    const next = {
        favorite: state.favorite.frozen ?? state.favorite.real,
        cart: state.cart.frozen ?? state.cart.real,
    };
    if (next.favorite === shown.favorite && next.cart === shown.cart) return;
    shown = next;
    listeners.forEach((l) => l());
}

/** メニューが、件数の実数を知らせる */
export function publishChipCount(target: ChipTarget, count: number) {
    state[target].real = count;
    recompute();
}

/**
 * 件数の表示を、今の値で止める。追加の書き込みの前に呼ぶ。戻り値の関数で、解く（何度呼んでもよい）。
 * 解き忘れても、一定時間で、自動で解ける
 */
export function freezeChipCount(target: ChipTarget): () => void {
    const s = state[target];
    if (s.holds === 0) s.frozen = s.real;
    s.holds++;
    let done = false;
    const release = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        s.holds--;
        if (s.holds === 0) s.frozen = null;
        recompute();
    };
    const timer = setTimeout(release, 4000);
    return release;
}

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
};

/** チップに出す件数。点が着くまで、追加した分は、含まない */
export function useShownChipCount(target: ChipTarget): number {
    return useSyncExternalStore(
        subscribe,
        () => shown[target],
        () => 0,
    );
}
