import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            英語学習の新しい形
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AIとの自然な対話を通じて、実践的な英語表現を楽しく学びましょう。
            あなたのペースで、効率的に語彙力と表現力を向上させることができます。
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-blue-600 text-white py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
            >
              無料で始める
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white text-blue-600 py-4 px-8 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg border-2 border-blue-600 shadow-lg"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            3つの特徴
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                対話型学習
              </h3>
              <p className="text-gray-600 leading-relaxed">
                AIチャットボットとの自然な会話を通じて、実際の場面で使える英語表現を身につけます。
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                音声再生機能
              </h3>
              <p className="text-gray-600 leading-relaxed">
                ネイティブスピーカーの発音を確認しながら、正しい発音を身につけることができます。
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-yellow-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ブックマーク機能
              </h3>
              <p className="text-gray-600 leading-relaxed">
                お気に入りの表現を保存して、いつでも復習できます。効率的な学習をサポートします。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-gradient-to-t from-white to-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ始めよう
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            登録は無料です。クレジットカードは不要です。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-blue-600 text-white py-4 px-10 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            無料アカウントを作成
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
