# DaiDai側への依頼（プロンプト）

2026-11-27。DaiDaiリポジトリ（`/home/arata/Rhing/Applications/DaiDai`）のClaude Codeに、次の文を貼る。HomePage側は実装済み。

---

HomePage側（daidai横丁）で、意匠のお気に入りとカートを作りました。あわせて、呼び名を統一しました。DaiDai側で、次の3つをお願いします。デプロイは、私が行います。コマンドは、1つずつ、コピーだけで終わる1行で渡してください。

## 1. `firestore.rules`: お気に入りとカートの保存先を足す

ぺったんの`favoritePacks`・`cartPacks`と同じ作りで、次の2つを足してください。

- `users/{userId}/favoriteDesigns/{packId}`: 本人だけが、読み取り・作成・削除できる。作成は、`themePacks/{packId}`の`creatorId`が自分なら拒否する（`favoritePacks`の`isOwnStickerPack`と同じ考え方。`isOwnThemePack`のような関数を足す）。
- `users/{userId}/cartDesigns/{packId}`: 本人だけが、読み書きできる。`cartPacks`と同じ。

ドキュメントの中身は`createdAt`（サーバー時刻）だけです。名前などは保存しません。カートの上限（50件）は、画面で制限しています。HomePageの実装は`src/lib/designLists.ts`です。

## 2. アカウント削除: 2つの保存先も消す

`functions/src/themePackAccountDeletion.ts`の`deleteThemePackData`と、`AccountDeletionStore`に、`users/{uid}/favoriteDesigns`と`users/{uid}/cartDesigns`の全削除を足してください（他の段と同じく、冪等に。400件ずつ）。`index.ts`の`deleteAccount`から呼ばれる経路で、2つとも消えることを、既存のテストの形に倣って確かめてください。

## 3. 呼び名の統一: 「意匠パック」「ぺったんパック」「素材パック」「パック」を使わない

利用者に見える文面は、全て「ぺったん」と「意匠」に統一しました。ぺったんの中の1枚は「画像」と書きます。DaiDai側も合わせてください。

サーバーが送る、お知らせの文面（`functions/src/themePackReview.ts`）を、次のとおりにしてください。HomePage側のデモ文と同じです。

- 承認: `意匠『桜』が承認され、公開されました。`
- 差し戻し: `意匠『桜』は、差し戻されました。理由は次のとおりです。\n{理由}`
- 配信停止（出品者）: `意匠『桜』の配信を停止しました。理由は次のとおりです。\n{理由}`
- 配信停止（取得した人）: `取得した意匠『桜』の配信が停止されました。表示は標準に戻ります。`

ぺったんの削除予告の文面（`functions/src/packDeletion.ts`の1枚を削除する側。HomePageの`src/lib/packDeletion.ts`の予告の表示と、同じ文にする必要が有ります）を、次のとおりにしてください。パック全体を削除する側の文面は、今のままです。

- 日時有り: `「{ぺったん名}」の中の「{画像名}」をお使いの利用者の方に連絡します。{日時}に使えなくなります。`
- 日時無し（緊急）: `「{ぺったん名}」の中の「{画像名}」をお使いの利用者の方に連絡します。緊急の対応のため、まもなく使えなくなります。`

アプリの文面（`lib/l10n/strings.dart`の`settingsThemePack...`、`lib/theme_pack/owned_theme_pack_repository.dart`の例外文など）の「意匠パック」「ぺったんパック」「素材パック」も、「意匠」「ぺったん」に直してください。例: `取得していない意匠です`、`通信できず、意匠を取得できません`。

コードのコメントと文書（`firestore.rules`・`storage.rules`・`lib/`・`functions/`のコメント、`文書/実装内容チェックリスト.md`）も、同じ方針で直してください。「パック」だけの言い方は、文脈で、ぺったんか意匠かを判断して、どちらかに統一してください。識別子（`themePack`、`packId`、`ownedThemePacks`、`stickerPacks`など）と、`PAID_PACKS_ENABLED`は、変えません。テストの期待文も、合わせてください。

直したら、テスト（`functions`と`flutter test`）を通してください。デプロイが要るもの（`firestore.rules`、`deleteAccount`、お知らせの文面の関数）は、デプロイのコマンドを、1つずつ渡してください。
