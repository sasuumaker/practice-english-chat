# API 設計書

## 1. 概要

### 1.1. 目的

本文書は、英語学習チャットシステムの API 設計について定義します。Next.js 15 の Server Actions と Supabase を活用し、型安全で効率的な API 実装を目指します。

### 1.2. 技術アーキテクチャ

- **フレームワーク**: Next.js 15 (App Router)
- **API 方式**: Server Actions
- **データベース**: Supabase (PostgreSQL 15.x)
- **認証**: Supabase Auth (auth.users テーブル使用)
- **AI 連携**: Vercel AI SDK + OpenAI
- **音声機能**: Web Speech API (クライアントサイド)
- **リアルタイム**: Supabase Realtime
- **セキュリティ**: Row Level Security (RLS)

### 1.3. Supabase + Server Actions の利点

- **TypeScript による型安全性**: クライアント・サーバー間の統合された開発体験
- **自動的な認証**: Supabase Auth による簡単なユーザー管理
- **Row Level Security**: データベースレベルでの自動的なアクセス制御
- **リアルタイム機能**: データベース変更の即座な反映
- **自動的な再検証**: Server Actions による効率的なデータ更新

## 2. 認証 API

### 2.1. Supabase Auth 統合

Supabase Auth を使用することで、以下の機能が自動的に提供されます：

- JWT トークンベースの認証
- セッション管理
- パスワードリセット
- ソーシャルログイン（将来拡張可能）

### 2.2. ユーザー登録

**Server Action**: `signUpAction`

```typescript
// app/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  // Supabase Auth でユーザー作成
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        display_name: username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // ユーザー作成後、プロフィール情報を users テーブルに保存
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      username: username,
      email: email,
    });

    if (profileError) {
      return { error: "プロフィールの作成に失敗しました" };
    }
  }

  redirect("/chat");
}
```

**入力パラメータ**:

- `email`: string（必須、有効なメールアドレス）
- `password`: string（必須、8 文字以上）
- `username`: string（必須、ユニークなユーザー名）

**レスポンス**:

- 成功時: `/chat` へリダイレクト
- エラー時: `{ error: string }`

### 2.3. ログイン

**Server Action**: `signInAction`

```typescript
export async function signInAction(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/chat");
}
```

**入力パラメータ**:

- `email`: string（必須）
- `password`: string（必須）

**レスポンス**:

- 成功時: `/chat` へリダイレクト
- エラー時: `{ error: string }`

### 2.4. ログアウト

**Server Action**: `signOutAction`

```typescript
export async function signOutAction() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
```

**入力パラメータ**: なし

**レスポンス**:

- 成功時: `/login` へリダイレクト
- エラー時: `{ error: string }`

### 2.5. 現在のユーザー情報取得

**Server Function**: `getCurrentUser`

```typescript
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // プロフィール情報も取得
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    username: profile?.username || user.user_metadata?.username,
    created_at: user.created_at,
  };
}
```

**入力パラメータ**: なし

**レスポンス**:

- 成功時: `UserProfile | null`
- エラー時: `null`

### 2.6. セッション確認

**Server Function**: `requireAuth`

```typescript
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
```

**用途**: 認証が必要なページで使用する共通関数

## 3. チャット機能 API

### 3.1. チャットセッション管理

#### 3.1.1. 新規チャットセッション作成

**Server Action**: `createChatSessionAction`

```typescript
// app/actions/chat.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function createChatSessionAction() {
  const user = await requireAuth();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      title: null, // 最初のメッセージから自動生成
    })
    .select()
    .single();

  if (error) {
    return { error: "チャットセッションの作成に失敗しました" };
  }

  revalidatePath("/chat");
  return { session: data };
}
```

#### 3.1.2. チャットセッション一覧取得

**Server Action**: `getChatSessionsAction`

```typescript
export async function getChatSessionsAction() {
  const user = await requireAuth();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select(
      `
      id,
      title,
      created_at,
      updated_at,
      messages(count)
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: "チャットセッションの取得に失敗しました" };
  }

  return { sessions: data };
}
```

### 3.2. メッセージ送信・AI 応答取得

**Server Action**: `sendMessageAction`

```typescript
import { openai } from "ai/openai";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  message_type: "user" | "ai_welcome" | "ai_response";
  content: string;
  created_at: string;
}

export interface EnglishExpression {
  id: string;
  message_id: string;
  expression_text: string;
  pronunciation?: string;
  difficulty_level?: string;
  created_at: string;
}

export async function sendMessageAction(sessionId: string, message: string) {
  const user = await requireAuth();
  const supabase = createClient();

  try {
    // 1. ユーザーメッセージを保存
    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        chat_session_id: sessionId,
        message_type: "user",
        content: message,
      })
      .select()
      .single();

    if (userMessageError) {
      return { error: "メッセージの保存に失敗しました" };
    }

    // 2. 会話履歴を取得
    const { data: history } = await supabase
      .from("messages")
      .select("message_type, content")
      .eq("chat_session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20); // 直近20件

    // 3. AI応答をストリーミング生成
    const stream = createStreamableValue("");

    (async () => {
      const { textStream } = await streamText({
        model: openai("gpt-4"),
        messages: [
          {
            role: "system",
            content: `あなたは英語学習をサポートするAIアシスタントです。
            ユーザーの質問に対して、実用的な英語表現を3つ提案してください。
            各表現には難易度レベル（beginner, intermediate, advanced）を付けてください。
            
            レスポンス形式：
            {
              "explanation": "簡潔な説明",
              "expressions": [
                {
                  "text": "英語表現",
                  "explanation": "使用場面や意味の説明（日本語）",
                  "difficulty_level": "beginner"
                }
              ]
            }`,
          },
          ...(history || []).map((msg) => ({
            role: msg.message_type === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        ],
      });

      let fullResponse = "";
      for await (const delta of textStream) {
        fullResponse += delta;
        stream.update(fullResponse);
      }

      // 4. AI応答メッセージを保存
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from("messages")
        .insert({
          chat_session_id: sessionId,
          message_type: "ai_response",
          content: fullResponse,
        })
        .select()
        .single();

      if (!aiMessageError && aiMessage) {
        // 5. 英語表現を解析して保存
        await saveEnglishExpressions(aiMessage.id, fullResponse);

        // 6. セッションタイトルを更新（初回メッセージの場合）
        await updateSessionTitle(sessionId, message);
      }

      stream.done();
    })();

    revalidatePath(`/chat/${sessionId}`);
    return {
      stream: stream.value,
      userMessageId: userMessage.id,
    };
  } catch (error) {
    return { error: "AI応答の生成に失敗しました" };
  }
}
```

### 3.3. 英語表現保存

**Helper Function**: `saveEnglishExpressions`

```typescript
async function saveEnglishExpressions(messageId: string, aiResponse: string) {
  const supabase = createClient();

  try {
    const parsed = JSON.parse(aiResponse);

    if (parsed.expressions && Array.isArray(parsed.expressions)) {
      const expressions = parsed.expressions.map((expr: any) => ({
        message_id: messageId,
        expression_text: expr.text,
        pronunciation: expr.pronunciation || null,
        difficulty_level: expr.difficulty_level || "intermediate",
      }));

      await supabase.from("english_expressions").insert(expressions);
    }
  } catch (error) {
    console.error("英語表現の保存に失敗:", error);
  }
}
```

### 3.4. セッションタイトル自動生成

**Helper Function**: `updateSessionTitle`

```typescript
async function updateSessionTitle(sessionId: string, firstMessage: string) {
  const supabase = createClient();

  // セッションにタイトルがない場合のみ更新
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("title")
    .eq("id", sessionId)
    .single();

  if (!session?.title) {
    const title =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;

    await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);
  }
}
```

### 3.5. チャット履歴取得

**Server Action**: `getChatHistoryAction`

```typescript
export async function getChatHistoryAction(sessionId: string) {
  const user = await requireAuth();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      message_type,
      content,
      created_at,
      english_expressions (
        id,
        expression_text,
        pronunciation,
        difficulty_level,
        bookmarks!inner(id)
      )
    `
    )
    .eq("chat_session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: "チャット履歴の取得に失敗しました" };
  }

  return { messages: data };
}
```

**入力パラメータ**:

- `sessionId`: string（チャットセッション ID）

**レスポンス**:

- 成功時: `{ messages: MessageWithExpressions[] }`
- エラー時: `{ error: string }`

## 4. ブックマーク機能 API

### 4.1. ブックマーク登録

**Server Action**: `addBookmarkAction`

```typescript
// app/actions/bookmark.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { revalidatePath } from "next/cache";

export interface Bookmark {
  id: string;
  user_id: string;
  english_expression_id: string;
  notes?: string;
  created_at: string;
  english_expressions: {
    id: string;
    expression_text: string;
    pronunciation?: string;
    difficulty_level?: string;
  };
}

export async function addBookmarkAction(expressionId: string, notes?: string) {
  const user = await requireAuth();
  const supabase = createClient();

  // 重複チェック（UNIQUE制約があるが、事前チェックでユーザビリティ向上）
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("english_expression_id", expressionId)
    .single();

  if (existing) {
    return { error: "既にブックマーク済みです" };
  }

  // ブックマーク登録
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      english_expression_id: expressionId,
      notes: notes || null,
    })
    .select(
      `
      id,
      user_id,
      english_expression_id,
      notes,
      created_at,
      english_expressions (
        id,
        expression_text,
        pronunciation,
        difficulty_level
      )
    `
    )
    .single();

  if (error) {
    return { error: "ブックマークの登録に失敗しました" };
  }

  revalidatePath("/bookmarks");
  return { bookmark: data };
}
```

**入力パラメータ**:

- `expressionId`: string（必須、英語表現 ID）
- `notes`: string（任意、ユーザーのメモ）

**レスポンス**:

- 成功時: `{ bookmark: Bookmark }`
- エラー時: `{ error: string }`

### 4.2. ブックマーク一覧取得

**Server Action**: `getBookmarksAction`

```typescript
export async function getBookmarksAction(
  page: number = 1,
  limit: number = 20,
  difficultyFilter?: string
) {
  const user = await requireAuth();
  const supabase = createClient();

  const offset = (page - 1) * limit;

  let query = supabase
    .from("bookmarks")
    .select(
      `
      id,
      notes,
      created_at,
      english_expressions (
        id,
        expression_text,
        pronunciation,
        difficulty_level
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 難易度フィルター
  if (difficultyFilter) {
    query = query.eq("english_expressions.difficulty_level", difficultyFilter);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return { error: "ブックマークの取得に失敗しました" };
  }

  return {
    bookmarks: data,
    totalCount: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
    hasNextPage: (count || 0) > offset + limit,
    hasPreviousPage: page > 1,
  };
}
```

**入力パラメータ**:

- `page`: number（任意、ページ番号、デフォルト: 1）
- `limit`: number（任意、1 ページあたりの件数、デフォルト: 20）
- `difficultyFilter`: string（任意、難易度フィルター）

**レスポンス**:

- 成功時:
  ```typescript
  {
    bookmarks: Bookmark[],
    totalCount: number,
    currentPage: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
  ```
- エラー時: `{ error: string }`

### 4.3. ブックマーク削除

**Server Action**: `removeBookmarkAction`

```typescript
export async function removeBookmarkAction(bookmarkId: string) {
  const user = await requireAuth();
  const supabase = createClient();

  // ブックマーク削除（RLS により自動的に user_id でフィルタされる）
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId);

  if (error) {
    return { error: "ブックマークの削除に失敗しました" };
  }

  revalidatePath("/bookmarks");
  return { success: true };
}
```

**入力パラメータ**:

- `bookmarkId`: string（必須、ブックマーク ID）

**レスポンス**:

- 成功時: `{ success: true }`
- エラー時: `{ error: string }`

### 4.4. ブックマーク状態確認

**Server Action**: `checkBookmarkStatusAction`

```typescript
export async function checkBookmarkStatusAction(expressionId: string) {
  const user = await requireAuth();
  const supabase = createClient();

  // ブックマーク状態確認
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("english_expression_id", expressionId)
    .single();

  if (error && error.code !== "PGRST116") {
    return { error: "ブックマーク状態の確認に失敗しました" };
  }

  return {
    isBookmarked: !!data,
    bookmarkId: data?.id || null,
  };
}
```

**入力パラメータ**:

- `expressionId`: string（必須、英語表現 ID）

**レスポンス**:

- 成功時: `{ isBookmarked: boolean, bookmarkId: string | null }`
- エラー時: `{ error: string }`

### 4.5. ブックマークメモ更新

**Server Action**: `updateBookmarkNotesAction`

```typescript
export async function updateBookmarkNotesAction(
  bookmarkId: string,
  notes: string
) {
  const user = await requireAuth();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .update({ notes })
    .eq("id", bookmarkId)
    .select()
    .single();

  if (error) {
    return { error: "メモの更新に失敗しました" };
  }

  revalidatePath("/bookmarks");
  return { bookmark: data };
}
```

**入力パラメータ**:

- `bookmarkId`: string（必須、ブックマーク ID）
- `notes`: string（必須、更新するメモ）

**レスポンス**:

- 成功時: `{ bookmark: Bookmark }`
- エラー時: `{ error: string }`

## 5. 音声機能 API

### 5.1. 音声再生（クライアントサイド）

音声機能は Web Speech API を使用してクライアントサイドで実装します。

```typescript
// lib/speech.ts
export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    if (this.voices.length === 0) {
      // 音声リストの読み込みを待つ
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis.getVoices();
      };
    }
  }

  public speak(text: string, lang: string = "en-US"): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("音声合成がサポートされていません"));
        return;
      }

      // 現在の音声を停止
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 英語音声を優先的に選択
      const englishVoice = this.voices.find((voice) =>
        voice.lang.startsWith("en-")
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error("音声再生エラー"));

      this.synthesis.speak(utterance);
    });
  }

  public stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }
}
```

## 6. データ型定義

### 6.1. 共通型

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Supabase Database型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: ChatSessionInsert;
        Update: ChatSessionUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      english_expressions: {
        Row: EnglishExpression;
        Insert: EnglishExpressionInsert;
        Update: EnglishExpressionUpdate;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: BookmarkInsert;
        Update: BookmarkUpdate;
      };
    };
    Enums: {
      message_type_enum: "user" | "ai_welcome" | "ai_response";
    };
  };
}
```

### 6.2. ユーザー関連型

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id: string; // auth.users.id と同じ
  username: string;
  email: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  created_at: string;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends AuthFormData {
  username: string;
  confirmPassword: string;
}
```

### 6.3. チャット関連型

```typescript
export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionInsert {
  user_id: string;
  title?: string | null;
}

export interface ChatSessionUpdate {
  title?: string;
}

export interface Message {
  id: string;
  chat_session_id: string;
  message_type: Database["public"]["Enums"]["message_type_enum"];
  content: string;
  created_at: string;
}

export interface MessageInsert {
  chat_session_id: string;
  message_type: Database["public"]["Enums"]["message_type_enum"];
  content: string;
}

export interface MessageUpdate {
  content?: string;
}

export interface MessageWithExpressions extends Message {
  english_expressions: EnglishExpression[];
}

export interface EnglishExpression {
  id: string;
  message_id: string;
  expression_text: string;
  pronunciation: string | null;
  difficulty_level: string | null;
  created_at: string;
}

export interface EnglishExpressionInsert {
  message_id: string;
  expression_text: string;
  pronunciation?: string | null;
  difficulty_level?: string | null;
}

export interface EnglishExpressionUpdate {
  expression_text?: string;
  pronunciation?: string | null;
  difficulty_level?: string | null;
}
```

### 6.4. ブックマーク関連型

```typescript
export interface Bookmark {
  id: string;
  user_id: string;
  english_expression_id: string;
  notes: string | null;
  created_at: string;
}

export interface BookmarkInsert {
  user_id: string;
  english_expression_id: string;
  notes?: string | null;
}

export interface BookmarkUpdate {
  notes?: string | null;
}

export interface BookmarkWithExpression extends Bookmark {
  english_expressions: {
    id: string;
    expression_text: string;
    pronunciation: string | null;
    difficulty_level: string | null;
  };
}

export interface BookmarkListResponse
  extends PaginatedResponse<BookmarkWithExpression> {}
```

### 6.5. AI 応答関連型

```typescript
export interface AIResponse {
  explanation: string;
  expressions: {
    text: string;
    explanation: string;
    difficulty_level: "beginner" | "intermediate" | "advanced";
    pronunciation?: string;
  }[];
}

export interface StreamingResponse {
  stream: ReadableStream<string>;
  messageId?: string;
}
```

## 7. エラーハンドリング

### 7.1. エラー分類

```typescript
export enum ApiErrorCode {
  // 認証エラー
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // バリデーションエラー
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_ERROR = "DUPLICATE_ERROR",

  // サーバーエラー
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",

  // 外部APIエラー
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  SPEECH_SERVICE_ERROR = "SPEECH_SERVICE_ERROR",
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: any;
}
```

### 7.2. エラーハンドラー

```typescript
// lib/error-handler.ts
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Supabaseエラー
    if ("code" in error) {
      return {
        code: ApiErrorCode.DATABASE_ERROR,
        message: "データベースエラーが発生しました",
        details: error.message,
      };
    }

    return {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: error.message,
    };
  }

  return {
    code: ApiErrorCode.INTERNAL_ERROR,
    message: "予期しないエラーが発生しました",
  };
}
```

## 8. Row Level Security (RLS) 実装

### 8.1. RLS ポリシー設定

Supabase では Row Level Security を使用して、データベースレベルでアクセス制御を実装します。

#### 8.1.1. users テーブル

```sql
-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の情報のみ読み取り可能
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- ユーザーは自分の情報のみ更新可能
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### 8.1.2. chat_sessions テーブル

```sql
-- RLS有効化
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のチャットセッションのみアクセス可能
CREATE POLICY "Users can access own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);
```

#### 8.1.3. messages テーブル

```sql
-- RLS有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のチャットセッションのメッセージのみアクセス可能
CREATE POLICY "Users can access messages in own sessions" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = messages.chat_session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );
```

#### 8.1.4. english_expressions テーブル

```sql
-- RLS有効化
ALTER TABLE english_expressions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のメッセージに関連する英語表現のみアクセス可能
CREATE POLICY "Users can access expressions in own messages" ON english_expressions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN chat_sessions ON messages.chat_session_id = chat_sessions.id
      WHERE messages.id = english_expressions.message_id
      AND chat_sessions.user_id = auth.uid()
    )
  );
```

#### 8.1.5. bookmarks テーブル

```sql
-- RLS有効化
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のブックマークのみアクセス可能
CREATE POLICY "Users can access own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

### 8.2. RLS の利点

- **自動的なフィルタリング**: アプリケーションコードで user_id チェックが不要
- **セキュリティの強化**: データベースレベルでの確実なアクセス制御
- **開発効率の向上**: 複雑な権限チェックロジックが簡素化

### 8.3. Server Actions での RLS 活用

```typescript
// RLSにより自動的にフィルタされるため、user_idの指定は不要
export async function getUserBookmarks() {
  const supabase = createClient();

  // RLSにより、認証ユーザーのブックマークのみ取得される
  const { data, error } = await supabase.from("bookmarks").select(`
      id,
      notes,
      created_at,
      english_expressions (
        expression_text,
        difficulty_level
      )
    `);

  return { data, error };
}
```

## 9. Supabase リアルタイム機能

### 9.1. リアルタイム機能の概要

Supabase Realtime を使用して、データベースの変更をリアルタイムでクライアントに反映できます。

### 9.2. チャットメッセージのリアルタイム更新

```typescript
// lib/realtime.ts
import { createClient } from "@/lib/supabase/client";

export function subscribeToMessages(
  sessionId: string,
  onMessage: (message: any) => void
) {
  const supabase = createClient();

  const subscription = supabase
    .channel(`messages:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_session_id=eq.${sessionId}`,
      },
      (payload) => {
        onMessage(payload.new);
      }
    )
    .subscribe();

  return subscription;
}

// 使用例（React コンポーネント内）
export function ChatMessages({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = subscribeToMessages(sessionId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
```

### 9.3. ブックマーク変更のリアルタイム反映

```typescript
export function subscribeToBookmarks(
  userId: string,
  onBookmarkChange: (change: any) => void
) {
  const supabase = createClient();

  const subscription = supabase
    .channel(`bookmarks:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT, UPDATE, DELETE すべて
        schema: "public",
        table: "bookmarks",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onBookmarkChange({
          event: payload.eventType,
          data: payload.new || payload.old,
        });
      }
    )
    .subscribe();

  return subscription;
}
```

### 9.4. リアルタイム機能の設定

```typescript
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // レート制限
    },
  },
});
```

## 10. セキュリティ考慮事項

### 10.1. 認証・認可

- **Supabase Auth**: JWT トークンベースの安全な認証
- **Row Level Security (RLS)**: データベースレベルでの自動的なアクセス制御
- **Server Actions**: サーバーサイドでの認証状態確認
- **CSRF 保護**: Next.js による自動的な CSRF 保護

### 8.2. データバリデーション

```typescript
// lib/validation.ts
import { z } from "zod";

export const bookmarkSchema = z.object({
  englishText: z
    .string()
    .min(1, "英語表現は必須です")
    .max(500, "英語表現は500文字以内で入力してください"),
  explanation: z
    .string()
    .max(1000, "説明は1000文字以内で入力してください")
    .optional(),
});

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "メッセージは必須です")
    .max(1000, "メッセージは1000文字以内で入力してください"),
});
```

### 8.3. レート制限

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 1分間に10回まで
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier
  );

  if (!success) {
    throw new Error(
      "レート制限に達しました。しばらく待ってから再試行してください。"
    );
  }

  return { limit, reset, remaining };
}
```

## 9. パフォーマンス最適化

### 9.1. キャッシング戦略

```typescript
// app/actions/cache.ts
import { unstable_cache } from "next/cache";

export const getCachedBookmarks = unstable_cache(
  async (userId: string) => {
    // ブックマーク取得ロジック
  },
  ["bookmarks"],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ["bookmarks"],
  }
);
```

### 9.2. ストリーミング対応

```typescript
// チャット応答のストリーミング
export async function streamChatResponse(message: string) {
  const stream = new ReadableStream({
    async start(controller) {
      // AI応答をストリーミングで送信
      for await (const chunk of aiResponseStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return stream;
}
```

## 10. 監視・ロギング

### 10.1. ログ出力

```typescript
// lib/logger.ts
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export function log(level: LogLevel, message: string, meta?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  };

  console.log(JSON.stringify(logEntry));
}
```

### 10.2. メトリクス収集

```typescript
// lib/metrics.ts
export function trackApiCall(
  endpoint: string,
  duration: number,
  success: boolean
) {
  // Vercel Analytics or other monitoring service
  if (process.env.NODE_ENV === "production") {
    // メトリクス送信
  }
}
```

## 12. Supabase クライアント設定

### 12.1. サーバーサイドクライアント

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Action 実行中の場合、クッキー設定をスキップ
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server Action 実行中の場合、クッキー削除をスキップ
          }
        },
      },
    }
  );
}
```

### 12.2. クライアントサイドクライアント

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 12.3. ミドルウェア設定

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 12.4. 環境変数設定

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API設定
OPENAI_API_KEY=your_openai_api_key

# Vercel設定（本番環境）
VERCEL_URL=your_vercel_url
```

## 13. 実装上の注意事項

### 13.1. Server Actions のベストプラクティス

- **認証確認**: すべての Server Action で `requireAuth()` を使用
- **データ検証**: `zod` を使用した入力データの検証
- **エラーハンドリング**: 統一されたエラー処理パターン
- **再検証**: `revalidatePath()` でキャッシュの適切な更新

### 13.2. パフォーマンス最適化

- **データベースクエリ**: 必要な列のみを SELECT
- **インデックス活用**: 頻繁に検索される列にインデックス設定
- **ページネーション**: 大量データの効率的な取得
- **キャッシング**: 静的データの適切なキャッシュ

### 13.3. セキュリティ対策

- **RLS の活用**: すべてのテーブルで適切な RLS ポリシー設定
- **入力サニタイゼーション**: XSS 攻撃の防止
- **レート制限**: API 乱用の防止
- **環境変数**: 機密情報の適切な管理

---

本 API 設計書は、要件定義書と DB 設計書に基づいて、Supabase と Next.js 15 の Server Actions を活用した実装を想定しています。Row Level Security やリアルタイム機能など、Supabase の特長を最大限に活用し、型安全性とパフォーマンスを重視した実装が可能な設計となっています。
