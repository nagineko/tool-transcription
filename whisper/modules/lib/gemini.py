import os
import google.generativeai as genai
from dotenv import load_dotenv
import time

load_dotenv()

# Geminiの初期設定
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
# モデルの選択（1.5 Flashは高速で無料枠も広く、長文に強いです）
model = genai.GenerativeModel('gemini-3-flash-preview')

def fix_transcript_long(text, chunk_size=4000): # Geminiは長文に強いのでchunkを大きくできます
    fixed_chunks = []
    
    # 意味を壊さないためのプロンプト
    instruction = (
        "あなたは優秀な編集者です。提供された日本語の文字起こしテキストを以下のルールで整形してください：\n"
        "1. 文脈の切れ目や意味のまとまりごとに、積極的に【改行】を入れて読みやすくしてください。\n"
        "2. 誤字脱字の修正、適切な句読点の追加を行ってください。\n"
        "3. 『えー』『あのー』などの不要な言葉は削除してください。\n"
        "4. 内容を要約せず、すべての情報を保持したまま整えてください。"
    )

    # テキスト分割
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    print(f"Geminiで全 {len(chunks)} ブロックの整形を開始します...")

    for i, chunk in enumerate(chunks):
        print(f"ブロック {i+1}/{len(chunks)} を処理中...")
        
        # 無料枠のRate Limit（秒間リクエスト制限）を考慮
        if i > 0:
            time.sleep(2) 

        try:
            # Geminiへのリクエスト
            response = model.generate_content(f"{instruction}\n\n対象テキスト：\n{chunk}")
            fixed_chunks.append(response.text.strip())
        except Exception as e:
            print(f"ブロック {i+1} でエラーが発生しました: {e}")
            fixed_chunks.append(chunk)

    return "\n".join(fixed_chunks)

def summarize_text(text):
    try:
        response = model.generate_content(f"提供されたテキストを日本語で簡潔に要約してください：\n\n{text}")
        return response.text.strip()
    except Exception as e:
        print(f"要約中にエラーが発生しました: {e}")
        return "要約の作成に失敗しました。"
