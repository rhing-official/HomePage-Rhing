// パックをカート・お気に入りに追加した時に、押したボタン（カードのハート・カートの丸ボタンなど）から、
// メニューのチップ（お気に入り・カート）へ、点を飛ばす。参考にした動画の動き:
//   1. ボタンの位置に、お気に入りはハート、カートはカートの形が現れる
//   2. その形が、弧を描き、回りながら小さくなって、チップへ飛ぶ。加速しながら着く。後ろに、淡い輪郭だけの残像が付く（形は、本体と同じ）
//   3. 着くと、チップのアイコンが弾み、件数のバッジが大きくなる（外した時は、飛び立つ時に弾む）
// 外した時は、チップから、点が一旦真上へ放られ、落ちながら消える（捨てる動き）。
// 位置は、押した瞬間に画面上で測る（getBoundingClientRect）ので、画面の幅・縦横・密度が違っても、ずれない。
// チップが画面に無い時（トップページなど、daidai横丁のメニューが出ていない画面）は、点は飛ばさない。ボタンのハート・カートの色の入れ替わり（WipeIcon）は、チップの有無に関わらず動く。

export type FlyTarget = "favorite" | "cart";

export type Point = { x: number; y: number };

// 点の大きさ（ピクセル）
const SIZE = 28;
// 現れてから飛び立つまでの割合と、全体の長さ
const APPEAR = 0.16;
const DURATION = 620;
// 弧の高さ（始点と終点の距離に対する割合）
const LIFT = 0.35;

/** 始点から終点へ、上へ膨らむ弧の上の点。t は 0〜1 */
export function arcPoint(from: Point, to: Point, t: number, lift = LIFT): Point {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    // 制御点: 中間より、画面の上へ持ち上げる
    const cx = (from.x + to.x) / 2;
    const cy = (from.y + to.y) / 2 - dist * lift;
    const u = 1 - t;
    return {
        x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
        y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
    };
}

// 飛び立ちから着くまでの、時間の進み方。加速して着く
const easeIn = (u: number) => u * u * u;

const center = (el: Element): Point => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// 飛ばす形。お気に入りはハート、カートはカート。アイコンは、lucide-react の形と同じ。
// 本体は、色で塗った形。残像は、輪郭だけ
const SHAPES: Record<FlyTarget, { body: string; color: string; fill: string }> = {
    favorite: {
        body: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
        color: "#f43f5e",
        fill: "#f43f5e",
    },
    cart: {
        body: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
        color: "#2563eb",
        fill: "#dbeafe",
    },
};

function shape(solid: boolean, target: FlyTarget) {
    const { body, color, fill } = SHAPES[target];
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        pointerEvents: "none",
        zIndex: "9999",
        opacity: "0",
        willChange: "transform, opacity",
    });
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" fill="${solid ? fill : "none"}" stroke="${color}" stroke-width="${solid ? 2 : 1.6}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
    document.body.appendChild(el);
    return el;
}

// 点の動きの種類。
// - collect: 追加。ボタンから、弧に沿って、回りながら小さくなって、加速してチップに吸い込まれる
// - toss: 外した時。チップから、一旦真上へ放られ、頂点を過ぎて落ちながら、回って、薄れて消える（捨てる動き）
type FlyStyle = "collect" | "toss";

// 放り投げる時: 一旦、真上へ放られ、頂点を過ぎて落ちながら、薄れて消える（捨てる動き）。横には、少しだけ流れる
const TOSS_RISE = 56; // 頂点までの高さ（画面の上端に近いチップでは、収まる高さに縮める）
const TOSS_DRIFT = 28; // 横に流れる最大の距離。押したボタンの側へ流れる
const TOSS_APEX = 0.35; // 頂点に着く時刻（0〜1）
const TOSS_DURATION = 520;
const TOSS_APPEAR = 0.15;

// 放り投げの軌道。y は、上へ放られて、頂点を過ぎ、落ちる放物線。x は、緩やかに流れる
function tossPoint(from: Point, to: Point, u: number): Point {
    const rise = Math.min(TOSS_RISE, Math.max(14, from.y - SIZE));
    const a = rise / (TOSS_APEX * TOSS_APEX);
    const b = 2 * a * TOSS_APEX;
    return {
        x: from.x + (to.x - from.x) * (1 - (1 - u) * (1 - u)),
        y: from.y + a * u * u - b * u,
    };
}

// 0〜appear は、始点で現れ、以降は、弧に沿って動く
function keyframes(from: Point, to: Point, peakOpacity: number, style: FlyStyle): Keyframe[] {
    const frames: Keyframe[] = [];
    const steps = 24;
    const toss = style === "toss";
    const appear = toss ? TOSS_APPEAR : APPEAR;
    for (let i = 0; i <= steps; i++) {
        const o = i / steps;
        const u = o <= appear ? 0 : (o - appear) / (1 - appear);
        const travel = easeIn(u);
        const p = toss ? tossPoint(from, to, u) : arcPoint(from, to, travel, LIFT);
        // 放り投げる時は、放られて少し大きくなり、回りながら、落ちる間に小さく薄れて消える
        const scale = o <= appear ? 0.5 + 0.5 * (o / appear) : toss ? 1 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.6)) - 0.4 * u * u : 1 - 0.65 * travel;
        const rotate = toss ? 160 * u : 220 * travel;
        const opacity =
            o <= appear
                ? peakOpacity * (o / appear)
                : toss
                  ? peakOpacity * Math.max(0, Math.min(1, 1 - (u - 0.45) / 0.55))
                  : o >= 0.94
                    ? peakOpacity * (1 - (o - 0.94) / 0.06)
                    : peakOpacity;
        frames.push({
            offset: o,
            transform: `translate(${p.x - SIZE / 2}px, ${p.y - SIZE / 2}px) rotate(${rotate}deg) scale(${scale})`,
            opacity,
        });
    }
    return frames;
}

// 着いた時の、チップの弾み。アイコンは、少し傾いて大きくなり、バッジは大きくなる
function bounce(chip: Element) {
    const icon = chip.querySelector("svg");
    icon?.animate(
        [
            { transform: "scale(1) rotate(0deg)" },
            { transform: "scale(1.25) rotate(-10deg)", offset: 0.35 },
            { transform: "scale(0.95) rotate(3deg)", offset: 0.7 },
            { transform: "scale(1) rotate(0deg)" },
        ],
        { duration: 420, easing: "ease-out" },
    );
    chip.querySelector("[data-fly-badge]")?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.45)", offset: 0.4 }, { transform: "scale(1)" }],
        { duration: 420, easing: "ease-out" },
    );
}

// 点を飛ばす。from から to へ。着いた時に onArrive、飛び立つ時に onDepart を呼ぶ
function fly(target: FlyTarget, from: Point, to: Point, style: FlyStyle, onDepart?: () => void, onArrive?: () => void) {
    // 残像 3つ、本体の順に、時間を少しずつ遅らせる
    const duration = style === "toss" ? TOSS_DURATION : DURATION;
    const ghosts = [3, 2, 1].map((n) => ({ el: shape(false, target), delay: n * 40, opacity: 0.18 + (3 - n) * 0.1 }));
    const lead = shape(true, target);
    for (const g of ghosts) {
        g.el.animate(keyframes(from, to, g.opacity, style), { duration, delay: g.delay, fill: "both" }).finished.finally(() => g.el.remove());
    }
    lead.animate(keyframes(from, to, 1, style), { duration, fill: "both" }).finished.finally(() => lead.remove());
    onDepart?.();
    // 着く少し前に、知らせる
    window.setTimeout(() => onArrive?.(), duration * 0.92);
}

// 動きを減らす設定（prefers-reduced-motion）は、見ない（2026-11-28、ユーザー指示。サイト内のアニメーションは、端末の設定に関わらず、全て実行する）。
const usable = () => typeof document !== "undefined";

/**
 * 追加した時: 押したボタン（カードのハート・カートの丸ボタンなど）から、メニューのチップへ。
 * release: 件数の表示を止めていたものを解く関数。点が着いた時に呼ぶ（飛ばさない時は、すぐに呼ぶ）
 */
export function flyToChip(button: Element | null, target: FlyTarget, release?: () => void): void {
    try {
        const chip = button && usable() ? document.querySelector(`[data-fly-target="${target}"]`) : null;
        const to = chip ? center(chip) : null;
        if (!button || !chip || !to || (to.x === 0 && to.y === 0)) {
            release?.();
            return;
        }
        fly(target, center(button), to, "collect", undefined, () => {
            bounce(chip);
            release?.();
        });
    } catch {
        // 演出だけなので、失敗しても、追加の動作には影響させない
        release?.();
    }
}

/**
 * 外した時: メニューのチップから、点が一旦真上へ放られ、落ちながら、薄れて消える（捨てる動き）。
 * release: 件数の表示を止めていたものを解く関数。点が飛び立つ時（チップが弾む時）に呼ぶ（飛ばさない時は、すぐに呼ぶ）
 */
export function flyFromChip(button: Element | null, target: FlyTarget, release?: () => void): void {
    try {
        const chip = button && usable() ? document.querySelector(`[data-fly-target="${target}"]`) : null;
        const from = chip ? center(chip) : null;
        if (!button || !chip || !from || (from.x === 0 && from.y === 0)) {
            release?.();
            return;
        }
        // 横に流れる向きと量: 押したボタンの側へ、少しだけ（真上に放って、少し流れる）
        const goal = center(button);
        const drift = Math.max(-TOSS_DRIFT, Math.min(TOSS_DRIFT, goal.x - from.x));
        const end = { x: from.x + drift, y: from.y };
        fly(
            target,
            from,
            end,
            "toss",
            () => {
                bounce(chip);
                release?.();
            },
        );
    } catch {
        // 演出だけなので、失敗しても、動作には影響させない
        release?.();
    }
}
