import subprocess
import os
import io
import json

def download_as_stream(url):
    # 成功したコマンドと同じパスとパラメータを定義
    cache_dir = '/tmp/yt-dlp-cache'
    cookie_path = '/app/whisper/youtube_cookies.txt'
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"

    # キャッシュディレクトリを念のため準備
    os.makedirs(cache_dir, exist_ok=True)
    os.chmod(cache_dir, 0o777)

    # 環境変数を継承
    env = os.environ.copy()
    env["PATH"] = f"/usr/local/bin:/usr/bin:/bin:{env.get('PATH', '')}"

    # --- 1. メタデータ(JSON)をOSコマンドで取得 ---
    # ここで meta['id'] を手に入れます
    meta_command = [
        'yt-dlp',
        '--cookies', cookie_path,
        '--user-agent', ua,
        '--js-runtime', 'node',
        '--remote-components', 'ejs:github',
        '--cache-dir', cache_dir,
        '--print-json',      # JSON形式で詳細情報を出力
        '--skip-download',   # ここではまだダウンロードしない
        url
    ]
    
    meta_proc = subprocess.run(meta_command, capture_output=True, text=True, env=env)
    if meta_proc.returncode != 0:
        error_log = meta_proc.stderr
        print(f"DEBUG: Metadata fetch failed. Log:\n{error_log}")
        raise Exception(f"Metadata fetch failed: {error_log}")
    
    # 取得した文字列を辞書に変換
    meta = json.loads(meta_proc.stdout)

    # --- 2. 音声データ(Binary)をOSコマンドで取得 ---
    # あなたが成功させたコマンドと全く同じパラメータです
    audio_command = [
        'yt-dlp',
        '--cookies', cookie_path,
        '--user-agent', ua,
        '--js-runtime', 'node',
        '--remote-components', 'ejs:github',
        '--cache-dir', cache_dir,
        '-x', '--audio-format', 'mp3',
        '-o', '-',           # 標準出力へ
        url
    ]

    process = subprocess.Popen(
        audio_command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env
    )

    stdout, stderr = process.communicate()

    if process.returncode != 0:
        error_log = stderr.decode('utf-8', errors='ignore')
        print(f"DEBUG: Audio download failed. Log:\n{error_log}")
        raise Exception(f"yt-dlp failed with code {process.returncode}")

    # 本物の meta 辞書と、音声データのバッファを返す
    return meta, io.BytesIO(stdout)