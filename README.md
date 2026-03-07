# TOEIC Idiom Coach

TOEIC 700〜860 点帯を想定した、日本語から英熟語を自由入力で学ぶ Next.js アプリです。  
Google ログイン、ルールベース中心の採点、OpenAI を使った曖昧判定、復習キュー、学習履歴を MVP として実装しています。

## 主な機能

- Google ログイン（Supabase Auth）
- 日本語 → 英熟語の自由入力問題
- ルールベース採点
- 曖昧ケースのみ OpenAI で追加判定
- 学習履歴の保存
- 復習キューの自動更新
- ダッシュボード / 学習 / 復習 / 履歴画面

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui 風の UI コンポーネント構成
- Supabase (Auth / Postgres)
- OpenAI API

## セットアップ

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.example` を元に `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

最低限必要な値:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

OpenAI を使う場合だけ以下も設定してください。

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

`SUPABASE_SERVICE_ROLE_KEY` は将来の管理系処理用に残していますが、現状の MVP では必須ではありません。

### 3. Supabase に SQL を適用

`[supabase/schema.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/schema.sql)` を SQL Editor で実行してください。

この SQL には以下が含まれます。

- テーブル作成
- RLS ポリシー
- 20 問分の seed データ

アプリ本体にはローカル問題バンクも入っているため、将来的に seed を拡張しやすい構成です。

既存の Supabase 環境で和訳問題を追加する場合は、追加で
`[20260307_add_translation_questions.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260307_add_translation_questions.sql)`
も実行してください。

### 4. Google ログインを有効化

Supabase Dashboard で Google Provider を設定し、以下のコールバック URL を登録してください。

- 開発: `http://localhost:3000/auth/callback`
- 本番: `https://<your-domain>/auth/callback`

### 5. 開発サーバーを起動

```bash
npm run dev
```

## OpenAI 採点の方針

- まず正規化 + ルールベース判定を実行
- 完全一致、表記ゆれ、軽微 typo、前置詞違いは即時判定
- 近いが断定しづらい回答のみ OpenAI に送信
- LLM 判定結果は `llm_judgment_cache` に保存して再利用

OpenAI 未設定でも、ルールベース採点だけでアプリは動作します。

## 復習ロジック

- `incorrect` → 1 日後
- `almost_correct` → 2 日後
- `correct` → 4 日後
- `correct` を連続で取ると間隔を少しずつ延長

## 主なディレクトリ

- `[app](/Users/shun/Desktop/codex-app/toeic-idiom-app/app)` : App Router の画面と API
- `[components](/Users/shun/Desktop/codex-app/toeic-idiom-app/components)` : UI と画面コンポーネント
- `[lib/data](/Users/shun/Desktop/codex-app/toeic-idiom-app/lib/data)` : 問題データとリポジトリ
- `[lib/scoring](/Users/shun/Desktop/codex-app/toeic-idiom-app/lib/scoring)` : 採点ロジック
- `[lib/supabase](/Users/shun/Desktop/codex-app/toeic-idiom-app/lib/supabase)` : Auth / SSR クライアント
- `[supabase](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase)` : SQL スキーマ

## デプロイ

Vercel 想定です。以下を設定すればそのままデプロイしやすい構成です。

- Supabase 環境変数
- OpenAI 環境変数（任意）
- Google OAuth の本番コールバック URL

## 今後の拡張候補

- 問題バンクを Supabase 主体に移行
- 英文穴埋め問題の追加
- ユーザー別の弱点分類
- 管理画面からの問題編集
