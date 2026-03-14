# TOEIC Idiom Coach

TOEIC 700〜860 点帯を想定した、英熟語と和訳を反復学習する Next.js アプリです。  
Google ログイン、ログインなし体験モード、ルールベース中心の採点、OpenAI を使った曖昧判定、復習キュー、学習履歴を実装しています。

## 主な機能

- Google ログイン（Supabase Auth）
- ログインなしの学習モード
- 日本語 → 英熟語 / 英熟語 → 和訳 / 例文和訳 / 例文英訳
- 自由入力 / 選択式
- スマホのキーボード音声入力と相性のよい和訳入力
- 「わからない」回答
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

`SUPABASE_SERVICE_ROLE_KEY` は将来の管理系処理用に残していますが、現状では必須ではありません。

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

問題チェック機能と「チェック済みのみ出題」を使う場合は、さらに
`[20260308_add_checked_idioms.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260308_add_checked_idioms.sql)`
も実行してください。

例文和訳モードを使う場合は、さらに
`[20260310_add_sentence_translation_questions.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260310_add_sentence_translation_questions.sql)`
も実行してください。

例文英訳モードを使う場合は、さらに
`[20260310_add_sentence_back_translation_questions.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260310_add_sentence_back_translation_questions.sql)`
も実行してください。

熟語をさらに追加したバッチ 1 を使う場合は、さらに
`[20260314_add_more_idioms_batch1.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260314_add_more_idioms_batch1.sql)`
も実行してください。

熟語をさらに追加したバッチ 2 を使う場合は、さらに
`[20260314_add_more_idioms_batch2.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260314_add_more_idioms_batch2.sql)`
も実行してください。

熟語をさらに追加したバッチ 3 を使う場合は、さらに
`[20260314_add_more_idioms_batch3.sql](/Users/shun/Desktop/codex-app/toeic-idiom-app/supabase/migrations/20260314_add_more_idioms_batch3.sql)`
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
デフォルトのモデル設定は `gpt-5-nano` です。

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

## 公開方法

このアプリは GitHub Pages には向いていません。

理由:

- App Router の動的ページを使っている
- `/api/answers` と `/api/checks` のサーバー API が必要
- Google ログインの callback と cookie ベース認証を使っている
- `OPENAI_API_KEY` をサーバー側だけに置く必要がある

GitHub Pages は静的ホスティングなので、上記を安全に動かせません。  
URL を知っている人に公開する用途では、Vercel を使うのが安全です。

### Vercel で公開する手順

1. GitHub リポジトリを Vercel に接続
2. Vercel の Environment Variables に以下を設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `OPENAI_API_KEY`（任意）
   - `OPENAI_MODEL`（任意。既定値は `gpt-5-nano`）
3. Supabase の `Site URL` と `Redirect URLs` に Vercel の本番 URL を追加
4. Google Cloud / Supabase Auth の callback URL に本番 URL を追加
5. 初回デプロイ後に、`/trial` と Google ログイン後の `/learn` を確認

### セキュリティ注意点

- `OPENAI_API_KEY` を GitHub やクライアント側コードに入れない
- `NEXT_PUBLIC_` が付く値は公開前提で扱う
- 体験モードは保存なしで公開し、本利用はログイン後に誘導する
- 公開前に Supabase の RLS と OAuth の callback URL を再確認する

`[vercel.json](/Users/shun/Desktop/codex-app/toeic-idiom-app/vercel.json)` には、最低限のセキュリティヘッダーを追加しています。

## 今後の拡張候補

- 問題バンクを Supabase 主体に移行
- 英文穴埋め問題の追加
- ユーザー別の弱点分類
- 管理画面からの問題編集
