// お気に入りとカートの、ぺったんと意匠を1つにまとめた一覧。追加した新しい順に並べる。

export type ItemKind = "petan" | "design";

export interface MixedItem<T> {
    kind: ItemKind;
    id: string;
    /** 追加した時刻（ミリ秒）。分からない（古いデータ）ものは0 */
    addedAt: number;
    data: T;
}

// 選択や key に使う、種別をまたいで重ならない識別子
export function itemKey(kind: ItemKind, id: string): string {
    return `${kind}:${id}`;
}

export function parseItemKey(key: string): { kind: ItemKind; id: string } {
    const i = key.indexOf(":");
    return { kind: key.slice(0, i) as ItemKind, id: key.slice(i + 1) };
}

// 新しい順。同じ時刻（時刻が無いものを含む）は、ぺったんを先にし、その中は元の並びを保つ
export function mergeByAddedAt<T>(petan: MixedItem<T>[], design: MixedItem<T>[]): MixedItem<T>[] {
    return [...petan, ...design].sort((a, b) => b.addedAt - a.addedAt || (a.kind === b.kind ? 0 : a.kind === "petan" ? -1 : 1));
}

// Firestore の Timestamp（または未確定の null）を、ミリ秒にする。読めなければ0
export function timestampToMillis(value: unknown): number {
    const v = value as { toMillis?: () => number } | null | undefined;
    return v && typeof v.toMillis === "function" ? v.toMillis() : 0;
}
