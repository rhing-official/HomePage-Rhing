---
name: hotrestart
description: 起動中のNext.js開発サーバー(next dev)を終了せずに、全ルートを再コンパイルさせて、表示が古い・HMRが効かない状態を直し、エラーの有無を確認する。サーバーが止まっているときは起動しない。ユーザーが「/hotrestart」「ホットリスタートして」「ホットリスタート」等と求めたときに使う。
---

# /hotrestart

呼び出されたら、方針確認を挟まず、起動中の`next dev`を**終了せずに**、ルートを再コンパイルさせて状態を作り直し、反映とエラーを確認する。ローカル内で完結する操作なので、確認なしで実行してよい。プロセスごと立ち上げ直したいときは`/server`（常に強制再起動する）。

Next.jsにはFlutterの`SIGUSR2`のような、プロセスへ送るホットリスタートが無い。代わりに、①ルートのレイアウトを`touch`して、接続中のブラウザへ全体の再読み込みを促し、②主要なルートへ実際にアクセスして再コンパイルさせる、という形で行う。

## 1. 起動中のプロセスを探す

```bash
pgrep -af "/home/arata/Rhing/HomePage/node_modules/.bin/[n]ext"
lsof -i :3001
```

- `[n]`の形にして、検索コマンド自身に一致しないようにする。
- 見つからない、または`localhost:3001`が応答しない場合は、起動していない旨を伝え、`/server`での起動を案内して終わる（勝手に起動しない）。
- 待ち受けているポートは、ログ（`/tmp/homepage-dev.log`の`Local:`の行）で確認する。3001でないときは、そのポートを使う。

## 2. 再コンパイルを促す

ログの現在位置を覚えてから、レイアウトを`touch`する（中身は変えない。gitの差分にならない）。

```bash
before=$(wc -l < /tmp/homepage-dev.log)
touch src/app/layout.tsx
```

## 3. 主要なルートを巡回して、反映とエラーを確認する

次のルートへ`curl`でアクセスし、HTTPステータスを確認する（初回アクセスでその場でコンパイルされるので、エラーもここで出る）。

```bash
for p in / /about /services "/services?tab=contract" /services/daidai /services/daidai-yokocho /services/dolce /services/contract/web /services/contract/app /daidai-yokocho /contact /legal/terms; do
  echo "$p $(curl -s -m 90 -o /dev/null -w '%{http_code} %{time_total}s' "localhost:3001$p")"
done
tail -n +$((before+1)) /tmp/homepage-dev.log
```

- 全て`200`で、ログに`Error`・`⨯`・`Failed`・コンパイルエラーが無ければ成功。
- `500`や、ログにエラーが出たら、その内容をそのまま報告する（成功と言わない）。直せるものはその場で直す。
- 変更を入れたルートが決まっているときは、そのルートの内容もHTMLで確認する（例: `curl -s localhost:3001/services/daidai | grep -o "<探したい文言>"`）。

## 4. 報告

- 成功か失敗かを一言で伝える。失敗ならログの該当部分を添える。
- ブラウザは、通常は自動で再読み込みされる。**それでも前の表示が残るときは、強制再読み込み（Ctrl+Shift+R）を案内する**。
- 次のようなときは、このスキルでは反映されない（`/server`で完全に起動し直す）:
  - `next.config.ts`・`.env*`・`package.json`の変更（Next.jsが自動で再起動する場合もあるが、確実ではない）。
  - 新しい依存パッケージの追加。
  - `public/`の画像を差し替えても古い画像が出る（`next/image`のキャッシュが残っている）とき。
