import { collection, doc, getDocs, limit, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// DaiDaiアプリのhasOwnedGroups（functions/src/index.ts）と同じ判定。
// firestore.rulesのgroups読み取り規則は「本人がmemberIdsに含まれる」ことを
// 要求するが、広場作成時に長は必ずmemberIdsに含まれるため、長を務める広場に
// 対してはこのクエリは問題なく成功する。
export async function hasOwnedGroups(uid: string): Promise<boolean> {
    const snapshot = await getDocs(
        query(collection(db, "groups"), where("ownerId", "==", uid), limit(1)),
    );
    return !snapshot.empty;
}

// DaiDaiアプリのUserRepository.requestAccountDeletionと同じFirestore直接更新
// （users/{uid}のupdateはfirestore.rulesで本人のみ許可されている）。
// 30日間操作が無ければCloud Functionsの定期処理がサーバーから完全削除する。
export async function requestAccountDeletion(uid: string): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        accountStatus: "pendingDeletion",
        deletionRequestedAt: serverTimestamp(),
    });
}
