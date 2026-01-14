from yt_dlp import YoutubeDL
import io
import subprocess

def download_as_stream(url):
    # Cookieファイルのパス（絶対パスにするのが安全）
    cookie_path = 'youtube_cookies.txt'

    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'cookiefile': cookie_path,
    }

    # 1. メタデータのみ取得
    with YoutubeDL(ydl_opts) as ydl:
        meta = ydl.extract_info(url, download=False)

    # 2. サブプロセスでyt-dlpを実行し、音声を標準出力(stdout)へ流す
    # 外部コマンドとして実行することで、確実にバイナリをキャプチャします
    command = [
        'yt-dlp',
        '--cookies', cookie_path,
        '-x',                          # 音声のみ抽出
        '--audio-format', 'mp3',       # mp3に変換
        '--audio-quality', '0',        # 高音質
        '-o', '-',                     # 標準出力に出力
        '--quiet',
        url
    ]

    # stdout=PIPEでバイナリをキャプチャ
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    if process.returncode != 0:
        raise Exception(f"YouTubeからの音声取得に失敗しました。: {stderr.decode()}")

    # 3. メモリ上のバイナリ(BytesIO)とメタデータを一緒に返す
    audio_buffer = io.BytesIO(stdout)
    return meta, audio_buffer
