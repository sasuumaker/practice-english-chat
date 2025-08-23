"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              English Chat
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden sm:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              ホーム
            </Link>

            <Link
              href="/signup"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/signup"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              新規登録
            </Link>

            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/login"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
            >
              ログイン
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="sm:hidden py-2 border-t border-gray-200">
            <Link
              href="/"
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>

            <Link
              href="/signup"
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-1 ${
                pathname === "/signup"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              新規登録
            </Link>

            <Link
              href="/login"
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-1 ${
                pathname === "/login"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              ログイン
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
