"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { startTranscription } from "./actions";

export default function Home() {
  const { data: session } = useSession();

  // --- Hooks は必ず関数の最初、if文より前に書く ---
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [debugLog, setDebugLog] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!url) return alert("URLを入力してください");
    
    setLoading(true);
    setResult("");
    setDebugLog(""); 
    
    try {
      const res = await startTranscription(url);
      
      // ログは成否に関わらずセットする
      if (res.debug) setDebugLog(res.debug);

      if (res.success) {
        setResult(res.content || "中身が空でした");
      } else {
        setResult("エラーが発生しました。下のデバッグログを確認してください。");
      }
    } catch (err) {
      setResult("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 1. まだログインしていない場合
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">YouTube文字起こしツール</h1>
        
        {/* Google公式デザイン風ボタン */}
        <button
          onClick={() => signIn("google")}
          className="flex items-center justify-center bg-white border border-gray-400 rounded-full px-8 py-3 text-lg font-medium text-[#3c4043] hover:bg-[#f8f9fa] hover:shadow-md transition-all duration-200 gap-4"
          style={{ fontFamily: "'Roboto', arial, sans-serif" }}
        >
          {/* GoogleロゴのSVG */}
          <svg width="24" height="24" viewBox="0 0 18 18" className="block">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34a853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.996 8.996 0 000 8.088l3.007-2.332z" fill="#fbbc05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.479 0 2.457 2.016.957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335"/>
          </svg>
          <span className="font-semibold tracking-wide">Sign in with Google</span>
        </button>
      </div>
    );
  }

  // 2. ログイン済みの場合（変更なし）
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">YouTube文字起こしツール</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-red-500 hover:underline"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 入力エリア（上の白いウィンドウ） */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <p className="mb-4 text-gray-700 font-medium">YouTubeのURLを入力してください：</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..." 
            className="flex-1 p-3 border rounded-lg shadow-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button 
            onClick={handleStart}
            disabled={loading}
            className={`px-6 py-2 text-white font-bold rounded-lg transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "解析中..." : "解析開始"}
          </button>
        </div>
      </div>

      {/* 結果表示エリア（下の白いウィンドウ） */}
      {(result || loading) && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 min-h-[300px] relative">
          
          {/* コピーボタン：結果がある時だけ右上に表示 */}
          {result && !loading && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                // 簡易的な通知としてアラートを出すか、状態を変えてアイコンを変えるのが一般的
                alert("クリップボードにコピーしました");
              }}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 shadow-sm flex items-center gap-2 text-sm bg-white"
              title="全内容をコピー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              コピー
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500 font-medium">AIが音声を解析しています。数分かかる場合があります...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-black font-sans text-base leading-relaxed pr-10">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
