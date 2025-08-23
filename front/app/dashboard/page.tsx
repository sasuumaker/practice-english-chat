import { requireAuth } from "../actions/auth";
import { createChatSession } from "../actions/chat";
import LogoutButton from "../components/LogoutButton";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ダッシュボード
              </h1>
              <p className="text-gray-600 mt-1">
                ようこそ、{user.username || user.email}さん
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 新しいチャットを開始 */}
          <form action={createChatSession}>
            <button
              type="submit"
              className="w-full text-left bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                新しいチャット
              </h2>
              <p className="text-gray-600 text-sm">
                AIとの新しい会話を開始して、英語学習を始めましょう
              </p>
            </button>
          </form>

          {/* チャット履歴 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              チャット履歴
            </h2>
            <p className="text-gray-600 text-sm">
              過去の会話を確認して、学習内容を復習できます
            </p>
          </div>

          {/* ブックマーク */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ブックマーク
            </h2>
            <p className="text-gray-600 text-sm">
              保存した英語表現を確認して、効率的に復習しましょう
            </p>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">学習統計</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-1">学習日数</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">会話数</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-600 mt-1">学習した表現</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-1">ブックマーク</p>
            </div>
          </div>
        </div>

        {/* 開発中のお知らせ */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                開発中の機能
              </h3>
              <p className="text-blue-700">
                チャット機能、学習履歴、ブックマーク機能は現在開発中です。
                まもなく利用可能になります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}