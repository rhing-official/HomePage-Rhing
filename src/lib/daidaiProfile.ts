import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// DaiDai本体の身だしなみ（icons[]/nicknames[]）とは独立した、daidai横丁専用の
// 任意プロフィール（2026-08-16追加）。users/{uid}のupdateはfirestore.rulesで
// 本人のみ許可されており（account.tsのrequestAccountDeletionと同パターン）、
// フィールド単位の制限は無いため新規フィールドをそのまま書き込める。
export const DEFAULT_DAIDAI_NICKNAME = "名無しさん";

// 呼び名は常に非nullを保証する（DaiDai本体のアクティブ呼び名への
// フォールバックを断つため。出品時に公開されるcreatorProfilesはDaiDai側
// リポジトリのCloud Functionがnull時のみDaiDaiの素材にフォールバックする
// ため、非nullにしておけば公開側でも借用されない）。
// この関数の呼び出し＝プロフィール設定完了とみなし、daidaiOnboardedも立てる。
export async function updateDaidaiProfile(
    uid: string,
    data: { nickname: string | null; iconUrl: string | null },
): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        daidaiNickname: data.nickname ?? DEFAULT_DAIDAI_NICKNAME,
        daidaiIconUrl: data.iconUrl,
        daidaiOnboarded: true,
    });
}
