"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function startTranscription(youtubeUrl: string) {
  // --- ここが最重要！サーバーサイドでセッションを確認 ---
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("認証が必要です。");
    // または return { success: false, error: "Unauthorized" };
  }
  // パス設定（絶対パス）
  const PROJECT_ROOT = "/app";
  const WHISPER_DIR = path.join(PROJECT_ROOT, "whisper");
  const listPath = path.join(WHISPER_DIR, "youtube.list");
  const pythonScriptPath = path.join(WHISPER_DIR, "main.py");
  const debugLogPath = path.join(WHISPER_DIR, "debug_python.log");

  console.log("--- Server Action Start ---");
  console.log("Input URL:", youtubeUrl);

  try {
    // 1. YouTube ID の抽出 (new URL() を使わずに文字列操作だけで行う)
    let videoId = "";

    if (youtubeUrl.includes("v=")) {
      // 標準URL: https://www.youtube.com/watch?v=XXXXXX
      const afterV = youtubeUrl.split("v=")[1];
      videoId = afterV.split("&")[0];
    } else if (youtubeUrl.includes("/shorts/")) {
      // ShortsURL: https://www.youtube.com/shorts/XXXXXX
      const afterShorts = youtubeUrl.split("/shorts/")[1];
      videoId = afterShorts.split("?")[0].split("/")[0];
    } else if (youtubeUrl.includes("youtu.be/")) {
      // 短縮URL: https://youtu.be/XXXXXX
      const afterDomain = youtubeUrl.split("youtu.be/")[1];
      videoId = afterDomain.split("?")[0].split("/")[0];
    }

    if (!videoId) {
      console.error("ID extraction failed for URL:", youtubeUrl);
      return { success: false, error: "URLから動画IDを抽出できませんでした。" };
    }

    console.log("Extracted Video ID:", videoId);

    // 2. youtube.list への書き込み (ここで止まっていた可能性大)
    try {
      fs.writeFileSync(listPath, youtubeUrl, "utf8");
      console.log("Successfully wrote to youtube.list");
    } catch (fsError: any) {
      console.error("File write error:", fsError);
      return { success: false, error: "youtube.listの書き込みに失敗しました: " + fsError.message };
    }

    // 3. Pythonスクリプトの実行
    const command = `python3 ${pythonScriptPath} > ${debugLogPath} 2>&1`;
    console.log("Executing command:", command);

    try {
      await execAsync(command, { 
        cwd: WHISPER_DIR, 
        timeout: 600000,
        env: { ...process.env } 
      });
      console.log("Python script finished execution");
    } catch (execError: any) {
      console.error("Python execution finished with error (check debug_python.log)");
    }

    // 4. 結果の読み込み
    const outputPath = path.join(WHISPER_DIR, "output", videoId, "fixed_text.txt");
    fs.appendFileSync(debugLogPath, `\n[Next.js Debug] Checking for file at: ${outputPath}\n`);

    if (fs.existsSync(outputPath)) {
      const content = fs.readFileSync(outputPath, "utf-8");
      fs.appendFileSync(debugLogPath, `[Next.js Debug] SUCCESS: File found and read. length: ${content.length}\n`);
      return { 
        success: true, 
        content: content,
        debug: fs.readFileSync(debugLogPath, "utf-8")
      };
    } else {
      // フォルダの中身をログに出して、何がズレているか特定する
      const outputDir = path.join(WHISPER_DIR, "output");
      const existingDirs = fs.existsSync(outputDir) ? fs.readdirSync(outputDir).join(", ") : "output dir not found";
      fs.appendFileSync(debugLogPath, `[Next.js Debug] ERROR: File NOT found.\nTarget ID: ${videoId}\nExisting dirs in output/: ${existingDirs}\n`);
      console.error("Output file not found.");
      return { 
        success: false, 
        error: `ファイルが見つかりません。探したパス: ${outputPath}`,
        debug: fs.readFileSync(debugLogPath, "utf-8")
      };
    }

  } catch (error: any) {
    console.error("Top level action error:", error);
    return { 
      success: false, 
      error: "予期せぬエラー: " + error.message 
    };
  }
}
