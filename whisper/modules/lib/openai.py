from modules.lib.gemini import OpenAI
import os
import time
from dotenv import load_dotenv
load_dotenv()

def fix_transcript_long(text, chunk_size=2000):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # テキストを指定した文字数(chunk_size)ごとに分割
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    fixed_chunks = []

    prompt_system = (
        "あなたは優秀な編集者です。提供された日本語の文字起こしテキストを以下のルールで整形してください：\n"
        "1. 文脈の切れ目や意味のまとまりごとに、積極的に【改行】を入れて読みやすくしてください。\n"
        "2. 誤字脱字の修正、適切な句読点の追加を行ってください。\n"
        "3. 『えー』『あのー』などの不要な言葉は削除してください。\n"
        "4. 内容を要約せず、すべての情報を保持したまま整えてください。"
    )

    print(f"全 {len(chunks)} ブロックの整形を開始します...")

    for i, chunk in enumerate(chunks):
        print(f"ブロック {i+1}/{len(chunks)} を処理中...")
        
        # API制限（Rate Limit）を避けるため、少し待機を入れる
        if i > 0:
            time.sleep(1) 

        try:
            # 最新の呼び出し形式に変更
            response = client.chat.completions.create(
                model="gpt-4o-2024-11-20",
                messages=[
                    {"role": "system", "content": prompt_system},
                    {"role": "user", "content": f"以下のテキストを読みやすく改行を入れて整形してください：\n\n{chunk}"}
                ],
                temperature=0.3,
            )
            fixed_chunks.append(response.choices[0].message.content.strip())
        except Exception as e:
            print(f"ブロック {i+1} でエラーが発生しました: {e}")
            fixed_chunks.append(chunk) # エラー時は未整形のまま追加

    return "\n".join(fixed_chunks)
