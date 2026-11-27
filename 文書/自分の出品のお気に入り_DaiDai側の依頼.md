# DaiDai側への依頼（プロンプト）: 自分のぺったんと意匠も、お気に入りに入れられるようにする

2026-11-27。DaiDaiリポジトリ（`/home/arata/Rhing/Applications/DaiDai`）のClaude Codeに、次の文を貼る。HomePage側は、自分の出品を除く条件を外し済み。

---

HomePage側（daidai横丁）で、自分が公開したぺったんと意匠も、お気に入りに追加できるようにしました。DaiDai側の`firestore.rules`で、自己お気に入りの拒否を外してください。デプロイは、私が行います。コマンドは、1つずつ、コピーだけで終わる1行で渡してください。

- `users/{userId}/favoritePacks/{packId}`の`create`から、`!isOwnStickerPack(packId, userId)`を外す。
- `users/{userId}/favoriteDesigns/{packId}`の`create`から、`!isOwnThemePack(packId, userId)`を外す。
- 他の者のお気に入りは、今までどおり、本人だけが読み書きできる。
- 使われなくなった`isOwnStickerPack`・`isOwnThemePack`は、他で使っていなければ削除する。関連するコメント（「自己お気に入り防止」）も直す。
- `firestore.rules`のテストが有れば、「自分の出品のお気に入りを拒否する」期待を、「作成できる」に直す。

既に有る自分の出品のお気に入りは無い（今まで拒否していた）ので、データの移行は要りません。
