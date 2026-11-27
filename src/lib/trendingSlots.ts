// トップの「人気」の枠の割り振り。ぺったんと意匠は、数え方が違う（販売数と取得数）ので、1つの順位には混ぜず、枠を分ける。
// 意匠に designSlots 枠を渡す。意匠がそれに満たない間は、ぺったんで埋める（逆はしない）。

export function pickTrendingSlots<P, D>(petan: P[], designs: D[], total = 5, designSlots = 2): { petan: P[]; designs: D[] } {
    const d = designs.slice(0, Math.min(designSlots, total));
    return { petan: petan.slice(0, total - d.length), designs: d };
}
