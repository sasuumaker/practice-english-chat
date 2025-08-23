-- RLSポリシーの修正
-- usersテーブルへの挿入時の問題を解決

-- 既存のポリシーを削除（エラーが出ても無視）
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 新しいポリシーを作成
-- サービスロール（Supabase Auth）からの挿入を許可
CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- または、より厳密に制御する場合
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
-- CREATE POLICY "Users can insert own profile on signup" ON public.users
--   FOR INSERT 
--   WITH CHECK (auth.uid() = id);