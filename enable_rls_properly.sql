-- 適切なRLSポリシーを設定（本番環境用）
-- このSQLは開発が安定してから実行してください

-- 1. RLSを有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 2. 既存のポリシーを削除（クリーンアップ）
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- 3. usersテーブルの新しいポリシー
-- 認証されたユーザーが自分のプロフィールを作成できる
CREATE POLICY "Enable insert for users" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 自分のプロフィールを閲覧できる
CREATE POLICY "Enable select for users" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 自分のプロフィールを更新できる
CREATE POLICY "Enable update for users" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. chat_sessionsテーブルのポリシー（既に設定済みの場合はスキップ）
DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;

CREATE POLICY "Enable all for own chat sessions" ON public.chat_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. messagesテーブルのポリシー
DROP POLICY IF EXISTS "Users can view messages in own chat sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in own chat sessions" ON public.messages;

CREATE POLICY "Enable select for own messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for own messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 6. english_expressionsテーブルのポリシー
DROP POLICY IF EXISTS "Users can view expressions in own messages" ON public.english_expressions;
DROP POLICY IF EXISTS "Users can create expressions in own messages" ON public.english_expressions;

CREATE POLICY "Enable select for own expressions" ON public.english_expressions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.chat_sessions ON chat_sessions.id = messages.chat_session_id
      WHERE messages.id = english_expressions.message_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for own expressions" ON public.english_expressions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.chat_sessions ON chat_sessions.id = messages.chat_session_id
      WHERE messages.id = english_expressions.message_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 7. bookmarksテーブルのポリシー
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Enable all for own bookmarks" ON public.bookmarks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);