# セットアップガイド

## 初期セットアップ手順

### 1. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトの設定から以下の情報を取得：
   - `Project URL`
   - `anon public key`

### 2. 環境変数の設定

`front/.env.local`ファイルに以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. データベースのセットアップ

Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行：

1. **テーブル作成**（`create_tables.sql`を実行）
   - usersテーブル
   - chat_sessionsテーブル
   - messagesテーブル
   - english_expressionsテーブル
   - bookmarksテーブル

2. **開発環境の場合**
   - 一時的にRLSを無効化：`disable_rls_temporarily.sql`を実行
   - これにより開発がスムーズに進められます

3. **本番環境の場合**
   - 適切なRLSポリシーを設定：`enable_rls_properly.sql`を実行
   - セキュリティを確保します

### 4. アプリケーションの起動

```bash
cd front
npm install
npm run dev
```

## トラブルシューティング

### 「プロフィールの作成に失敗しました」エラーが出る場合

1. **原因**: RLS（Row Level Security）ポリシーが厳格すぎる
2. **解決方法**:
   - 開発環境：`disable_rls_temporarily.sql`を実行
   - 本番環境：`enable_rls_properly.sql`を実行して適切なポリシーを設定

### 「Could not find the table 'public.users'」エラーが出る場合

1. **原因**: テーブルが作成されていない
2. **解決方法**: `create_tables.sql`を実行

## セキュリティに関する注意事項

### 開発環境
- RLSを無効化しても問題ありませんが、本番移行前に必ず有効化してください

### 本番環境
- 必ずRLSを有効化してください
- `enable_rls_properly.sql`を実行して適切なポリシーを設定
- 環境変数は安全に管理してください

## データベース構造

### users
- ユーザーの基本情報を管理
- Supabase Authと連携

### chat_sessions
- ユーザーごとのチャットセッションを管理

### messages
- チャット内のメッセージを保存

### english_expressions
- 英語表現とその詳細情報を管理

### bookmarks
- ユーザーがブックマークした英語表現を管理

## 今後の開発予定

1. メール認証の実装
2. パスワードリセット機能
3. プロフィール編集機能
4. チャット機能の実装
5. AI応答機能の統合