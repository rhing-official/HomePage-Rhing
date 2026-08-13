# HomePage-Rhing

Rhing公式サイト。トップページ・団体概要・サービス紹介に加えて、daidai横丁（DaiDaiのペタピタ販売ストア）セクションを持つ。

返答は日本語

## Git管理

- リモート: `https://github.com/rhing-official/HomePage-Rhing`
- デフォルトブランチ: `main`
- `/diary`実行時は、`日記.md`の更新に加えてその時点のリポジトリ全体の変更（`src/`等）も含めて確認なしで即座にpushする運用（詳細は`.claude/skills/diary/SKILL.md`）。`/diary`を経由しない通常のコード変更のpushは、これまで通り都度確認を取ること。
- `/release`実行時は、バージョンタグの作成・push・GitHub Release作成を確認なしで実行する運用（詳細は`.claude/skills/release/SKILL.md`）。未コミット変更の扱いとバージョン番号のみユーザーに確認する。

## デプロイ

- ホスティング: Vercel（プロジェクト`homepage-rhing`、チーム`rhingofficial-3304`）。
- Production環境のBranch Trackingは`main`ではなく`production`ブランチ。本番ドメイン`rhing.jp`はこの`production`ブランチにのみ紐づく。
- `main`へのpushは本番ドメインに影響しない。Vercelログイン必須のPreview URL（`homepage-rhing-git-main-....vercel.app`）が自動発行されるのみ（SSO保護・`noindex`）。
- 本番反映はGitHub Releaseを作成した時のみ発生する。`.github/workflows/promote-production.yml`が`release: published`イベントで`production`ブランチをリリースタグの内容に更新し、それをVercelが検知して`rhing.jp`へデプロイする。
- リリースは`/release`スキルで作成する。
