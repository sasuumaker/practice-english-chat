import SignUpForm from "../components/SignUpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録 | English Chat Learning",
  description: "英語学習チャットシステムの新規登録ページ",
};

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="mt-2 text-gray-600">AIとの対話で英語表現を学ぼう</p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
}
