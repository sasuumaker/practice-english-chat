-- RLSを一時的に無効化（開発環境のテスト用）
-- 警告：本番環境では実行しないこと！

-- usersテーブルのRLSを無効化
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 他のテーブルのRLSも一時的に無効化
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_expressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- 動作確認後、以下のSQLでRLSを再度有効化すること
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.english_expressions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;