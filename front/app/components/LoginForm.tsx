"use client";

import { useState, useTransition } from "react";
import { signInAction } from "../actions/auth";
import type { AuthResult } from "@/lib/types/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signInAction(formData);
      setResult(result);

      if (result.success) {
        // ログイン成功後、ダッシュボードへリダイレクト
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <form action={handleSubmit} className="space-y-6">
        {/* メールアドレス */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-900"
            placeholder="example@email.com"
          />
        </div>

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            disabled={isPending}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-900"
            placeholder="パスワードを入力"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              ログイン中...
            </span>
          ) : (
            "ログイン"
          )}
        </button>

        {/* 新規登録リンク */}
        <div className="pt-6 border-t border-gray-200">
          <a
            href="/signup"
            className="block w-full text-center bg-white text-green-600 py-3 px-4 rounded-lg border-2 border-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 font-semibold"
          >
            新規アカウント作成
          </a>
        </div>
      </form>

      {/* 結果メッセージ */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-lg flex items-start gap-2 ${
            result.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {result.success ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <p className="text-sm font-medium">
            {result.success ? result.message : result.error}
          </p>
        </div>
      )}
    </div>
  );
}
