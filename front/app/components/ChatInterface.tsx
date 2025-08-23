"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../actions/chat";
import Link from "next/link";

interface Message {
  id?: string;
  message_type: "user" | "ai_welcome" | "ai_response";
  content: string;
  created_at?: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: Message[];
  sessionTitle: string;
}

export default function ChatInterface({
  sessionId,
  initialMessages,
  sessionTitle,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // ユーザーメッセージを即座に表示
    const tempUserMessage: Message = {
      message_type: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // AIの応答を取得
      const result = await sendMessage(sessionId, userMessage);
      
      if (result.success && result.message) {
        // AI応答を追加
        const aiMessage: Message = {
          message_type: "ai_response",
          content: result.message,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // エラーメッセージを表示
        alert(result.error || "メッセージの送信に失敗しました");
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      alert("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // Enterキーでの送信（Shift+Enterで改行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // メッセージのレンダリング
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.message_type === "user";
    const isWelcome = message.message_type === "ai_welcome";

    return (
      <div
        key={message.id || index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : isWelcome
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {/* メッセージヘッダー */}
          <div className={`text-xs mb-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
            {isUser ? "あなた" : isWelcome ? "システム" : "AI"}
          </div>
          
          {/* メッセージ本文 */}
          <div className="whitespace-pre-wrap break-words">
            {/* 【】で囲まれた英語表現を強調表示 */}
            {message.content.split(/(\【[^】]+\】)/g).map((part, i) => {
              if (part.startsWith("【") && part.endsWith("】")) {
                const expression = part.slice(1, -1);
                return (
                  <span
                    key={i}
                    className={`font-bold ${
                      isUser ? "text-yellow-200" : "text-blue-600"
                    }`}
                  >
                    {expression}
                  </span>
                );
              }
              return part;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{sessionTitle}</h1>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力してください（英語または日本語）"
              disabled={isLoading}
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Shift + Enter で改行、Enter で送信
          </div>
        </div>
      </div>
    </div>
  );
}