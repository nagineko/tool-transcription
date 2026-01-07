"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

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
        <h1 className="text-xl font-bold">YouTube文字起こし</h1>
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

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <p className="mb-4 text-gray-700">YouTubeのURLを入力してください：</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="https://www.youtube.com/watch?v=..." 
            className="flex-1 p-2 border rounded shadow-sm text-black"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            解析開始
          </button>
        </div>
      </div>
    </div>
  );
}
