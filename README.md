# tool-transcription
```
pythonインストール
sudo apt install ffmpeg
sudo apt install nodejs
pip install -r requirements.txt
```

## whisper
### Environment
```
Windows 11
WSL2
Python 3.11.11
node v20.9.0
npm 10.1.0
```

### Installation
```sh
cd whisper
```

#### 1. API Keyの取得
whisperのAPI Keyを取得してください。  
https://whisperapi.com/

openaiのAPI Keyを取得してください。  
https://platform.openai.com/account/api-keys

#### 2. API Keyを環境変数に設定
.envを作成し、各環境変数に取得したAPI Keyを設定してください。
```sh
cp .env.example .env
touch youtube.list
```

#### 3. 文字起こししたい動画URL保存先ファイルを作成する
```sh
touch youtube.list
```

## Usage
### 1. Youtubeの動画URLを記載する
文字起こししたい動画URLを`youtube.list`に記載してください。  
改行で複数指定もできます。

### 2. 文字起こしを開始する
次のコマンドで文字起こしを開始します。
```sh
python main.py
```

### 3. 実行結果を確認する
実行すると`output`ディレクトリに結果が出力されます。
```python
python main.py
tree -a output
  output
  └── ucn4jAPWBdQ                                   # Youtubeの動画ID
      ├── fixed_text.txt                            # 文字起こしテキストファイル
      └── raw_text.txt                               # 文字起こし中間データ
```
