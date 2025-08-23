"use client";

import { useState, useTransition, useEffect } from "react";
import { signUpAction } from "../actions/auth";
import type { AuthResult } from "@/lib/types/auth";

// パスワード強度の判定
function getPasswordStrength(password: string): {
  level: "weak" | "medium" | "strong";
  color: string;
  text: string;
} {
  if (!password) {
    return { level: "weak", color: "#EF4444", text: "" };
  }

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  let strength = 0;
  if (hasLowerCase) strength++;
  if (hasUpperCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecialChar) strength++;
  if (isLongEnough) strength++;

  if (strength <= 2) {
    return { level: "weak", color: "#EF4444", text: "弱い" };
  } else if (strength <= 3) {
    return { level: "medium", color: "#F59E0B", text: "普通" };
  } else {
    return { level: "strong", color: "#10B981", text: "強い" };
  }
}

export default function SignUpForm() {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength("")
  );
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setShowPasswordMismatch(true);
    } else {
      setShowPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signUpAction(formData);
      setResult(result);

      if (result.success) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-900"
            placeholder="8文字以上（大文字・小文字・数字を含む）"
          />
          {/* パスワード強度インジケーター */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width:
                        passwordStrength.level === "weak"
                          ? "33%"
                          : passwordStrength.level === "medium"
                          ? "66%"
                          : "100%",
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* パスワード確認 */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            パスワード確認
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            disabled={isPending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-900 ${
              showPasswordMismatch ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="上記と同じパスワードを入力"
          />
          {showPasswordMismatch && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              パスワードが一致しません
            </p>
          )}
        </div>

        {/* ユーザー名 */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            disabled={isPending}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-gray-900"
            placeholder="表示名（3文字以上）"
            maxLength={50}
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isPending || showPasswordMismatch}
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
              登録中...
            </span>
          ) : (
            "アカウント作成"
          )}
        </button>

        {/* ログインリンク */}
        <div className="pt-6 border-t border-gray-200">
          <a
            href="/login"
            className="block w-full text-center bg-white text-blue-600 py-3 px-4 rounded-lg border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold"
          >
            既にアカウントをお持ちの方
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
