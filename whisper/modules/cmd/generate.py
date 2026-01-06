import modules.lib.whisper as whisper
import modules.lib.ydl as ydl
import modules.lib.gemini as gemini
import modules.lib.path as path
import modules.lib.format as fmt


def _task(url):
    if not url.startswith('http'):
        return

    # メモリ上にダウンロード（ファイルは生成されない）
    meta, audio_buffer = ydl.download_as_stream(url)

    # メモリ上のデータをWhisper APIへ送信
    res = whisper.call(audio_buffer, filename=f"{meta['id']}.mp3")

    # 文字起こし結果と要約を保存（テキストファイルのみローカルに残る）
    # Whisperから返ってきた全文テキスト
    raw_text = res.get('text', '')

    # 1. 生の文字起こしを保存
    path.save_file(meta['id'], 'raw_text.txt', fmt.text_readable(raw_text))
    # path.save_file(meta['id'], 'raw_text.txt', fmt.text_readable(raw_text))

    # 2. ChatGPTに修正させる
    print("ChatGPTでテキストを整形中...")
    fixed_text = gemini.fix_transcript_long(raw_text)

    # 3. 修正後の全文を保存
    path.save_file(meta['id'], 'fixed_text.txt', fmt.text_readable(fixed_text))
    
def exec():
    with open('youtube.list', 'r') as f:
        urls = f.read().split("\n")

    for url in urls:
        try:
            _task(url)
        except Exception as e:
            print(f'{url} failed.', e)
