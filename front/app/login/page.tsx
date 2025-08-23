import LoginForm from "../components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | English Chat Learning",
  description: "英語学習チャットシステムのログインページ",
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">
            おかえりなさい！学習を続けましょう
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
