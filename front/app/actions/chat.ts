"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./auth";
import { redirect } from "next/navigation";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

/**
 * 新しいチャットセッションを作成
 */
export async function createChatSession() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      title: "新しいチャット",
    })
    .select()
    .single();

  if (error) {
    console.error("チャットセッション作成エラー:", error);
    throw new Error("チャットセッションの作成に失敗しました");
  }

  // ウェルカムメッセージを追加
  await supabase.from("messages").insert({
    chat_session_id: data.id,
    message_type: "ai_welcome",
    content: "こんにちは！英語学習のお手伝いをします。何か質問がありますか？気軽に英語や日本語で話しかけてください。",
  });

  redirect(`/chat/${data.id}`);
}

/**
 * メッセージを送信してAIの応答を取得
 */
export async function sendMessage(
  sessionId: string,
  content: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // セッションの所有者確認
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return { success: false, error: "セッションが見つかりません" };
    }

    // ユーザーメッセージを保存
    const { error: userMsgError } = await supabase.from("messages").insert({
      chat_session_id: sessionId,
      message_type: "user",
      content: content,
    });

    if (userMsgError) {
      console.error("メッセージ保存エラー:", userMsgError);
      return { success: false, error: "メッセージの送信に失敗しました" };
    }

    // 過去のメッセージを取得（コンテキスト用）
    const { data: previousMessages } = await supabase
      .from("messages")
      .select("message_type, content")
      .eq("chat_session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // AI応答を生成
    const systemPrompt = `あなたは英語学習をサポートする親切なAIアシスタントです。
以下のガイドラインに従って応答してください：

1. ユーザーが英語で質問した場合は英語で、日本語で質問した場合は日本語で応答してください
2. 英語の文法、語彙、表現について分かりやすく説明してください
3. 実践的な例文を提供してください
4. ユーザーのレベルに合わせて説明を調整してください
5. 励ましや応援のメッセージを含めて、学習意欲を高めてください
6. 重要な英語表現は【】で囲んで強調してください（例：【get up】）`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(previousMessages || []).map((msg) => ({
        role: msg.message_type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
    ];

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        messages,
        temperature: 0.7,
        maxTokens: 1000,
      });

      // AI応答を保存
      const { data: aiMessage, error: aiMsgError } = await supabase
        .from("messages")
        .insert({
          chat_session_id: sessionId,
          message_type: "ai_response",
          content: text,
        })
        .select()
        .single();

      if (aiMsgError) {
        console.error("AI応答保存エラー:", aiMsgError);
        return { success: false, error: "応答の保存に失敗しました" };
      }

      // 英語表現を抽出して保存（【】で囲まれた表現）
      const expressions = text.match(/【([^】]+)】/g);
      if (expressions && aiMessage) {
        for (const exp of expressions) {
          const cleanExp = exp.replace(/【|】/g, "");
          await supabase.from("english_expressions").insert({
            message_id: aiMessage.id,
            expression_text: cleanExp,
            difficulty_level: "intermediate", // TODO: レベル判定ロジックを追加
          });
        }
      }

      // セッションタイトルを更新（最初のユーザーメッセージの場合）
      const { data: messageCount } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("chat_session_id", sessionId)
        .eq("message_type", "user");

      if (messageCount && messageCount.length === 1) {
        // 最初のメッセージの場合、タイトルを更新
        await supabase
          .from("chat_sessions")
          .update({ title: content.slice(0, 50) })
          .eq("id", sessionId);
      }

      return { success: true, message: text };
    } catch (aiError) {
      console.error("AI生成エラー:", aiError);
      return { 
        success: false, 
        error: "AI応答の生成に失敗しました。しばらく待ってから再試行してください。" 
      };
    }
  } catch (error) {
    console.error("予期しないエラー:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * チャット履歴を取得
 */
export async function getChatHistory() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("チャット履歴取得エラー:", error);
    return [];
  }

  return data || [];
}