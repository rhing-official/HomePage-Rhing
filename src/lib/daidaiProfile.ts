import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// DaiDai本体の身だしなみ（icons[]/nicknames[]）とは独立した、daidai横丁専用の
// 任意プロフィール（2026-08-16追加）。users/{uid}のupdateはfirestore.rulesで
// 本人のみ許可されており（account.tsのrequestAccountDeletionと同パターン）、
// フィールド単位の制限は無いため新規フィールドをそのまま書き込める。
// null指定で未設定に戻すと、DaiDaiのアクティブ呼び名/アイコンにフォールバックする
// （DaiDai側functions/src/index.tsのbuildCreatorProfileFields参照）。
export async function updateDaidaiProfile(
    uid: string,
    data: { nickname: string | null; iconUrl: string | null },
): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        daidaiNickname: data.nickname,
        daidaiIconUrl: data.iconUrl,
    });
}
