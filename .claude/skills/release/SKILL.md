---
name: release
description: mainブランチの現在の内容をもとにGitHubのバージョンタグとReleaseを作成する。作成したReleaseはGitHub Actions(promote-production.yml)経由でproductionブランチに反映され、Vercelが本番ドメイン(rhing.jp)へ自動デプロイする。ユーザーが「/release」と指示したときに使う。
---

# /release

呼び出されたら、以下を順に行う。バージョンタグの作成・push・GitHub Release作成、およびそれに伴う本番ドメインへの反映は事前承認済みの操作として都度の確認なしで実行してよい。ただし「未コミット変更の扱い」と「バージョン番号」の2点だけは必ずユーザーに確認する。

## 1. 前提確認

- `git status`で未コミットの変更がないか確認する。
  - ある場合: 変更内容を提示し、「このリリースに含めてコミットするか」「含めずに中断するか」をユーザーに確認する。黙って含めたり、黙って無視したりしない。
- `git fetch origin`した上で、ローカル`main`が`origin/main`と一致しているか確認する。
  - ローカルが遅れている場合: pullしてよいかユーザーに確認する。
  - ローカルが進んでいる(未push commitがある)場合: そのままリリース対象に含めてよいかを確認する。

## 2. バージョン番号を決める

- `git tag --sort=-v:refname`で既存のバージョンタグ一覧を取得し、直近バージョンを確認する(例: `v1.0.0`)。
- 呼び出し時の引数でバージョンが明示されていれば(例:`/release v1.2.0`)それを使う。
- 無指定の場合は直近バージョンのpatchを1つ上げた値(例: `v1.0.0` → `v1.0.1`)をデフォルト案として、AskUserQuestionで「このままpatchで良いか」「minor/majorにするか」「カスタム値を入力するか」を確認する。
- タグが1つも無い場合は`v1.0.0`を提案する。

## 3. リリースノートを作成する

- `git log <直近タグ>..HEAD --oneline`で、直近タグから今回リリース対象コミットまでの一覧を取得する。
- コミットが0件(前回タグから変更が無い)場合は、リリースするものが無い旨をユーザーに伝えてここで中断する。
- 取得したコミットメッセージを箇条書きに整形し、リリースノート本文とする。日記.mdの内容と同様、実際のコミット履歴に基づく事実のみを書き、内容を捏造・誇張しない。

## 4. タグ作成・push

```bash
git tag -a vX.Y.Z -m "Ver.X.Y.Z"
git push origin vX.Y.Z
```

## 5. GitHub Release作成

```bash
gh release create vX.Y.Z --title "Ver.X.Y.Z" --notes "<3で作成したリリースノート>"
```

## 6. 本番反映の確認

- Release公開(`release: published`イベント)により`.github/workflows/promote-production.yml`が自動起動し、`production`ブランチをこのタグの内容に更新する。
- `gh run list --workflow=promote-production.yml --limit 1 --json status,conclusion,url`等でこのActionsの実行状況を確認し、`completed`/`success`になるまで数十秒程度ポーリングする。
- 成功したら、Vercelが`production`ブランチの更新を検知して本番ドメイン(`rhing.jp`)へ自動デプロイする。`curl -s https://rhing.jp`等で、期待する変更点が実際に反映されているか簡易確認する(即座に反映されない場合は少し待って再確認する)。
- Actionsが失敗した場合は、無理に再実行やforce pushで解決しようとせず、失敗したjobのログURLを添えてユーザーに報告する。

## 7. 結果報告

- 作成したバージョン番号、GitHub ReleaseのURL、本番ドメインへの反映確認結果(成功/失敗)を簡潔にユーザーに伝える。
