# tool-transcription

## terraform
### Environment
```sh
Windows 11
WSL2
node: v18.18.2
npm: 9.8.1
terraform: 1.6.1
awscli: 1.15.58
```

### Installation
#### 1. ライブラリのインストール
```sh
sudo apt update -y && sudo apt upgrade -y
git clone https://github.com/tfutils/tfenv.git ~/.tfenv
echo 'export PATH="$HOME/.tfenv/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
sudo apt install -y zip
tfenv install 1.6.1
tfenv use 1.6.1
sudo apt install -y awscli
```

```sh
# SSHキーの生成（パスフレーズなし）
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

# 公開鍵を表示
cat ~/.ssh/id_rsa.pub
```
### Usage
```sh
cd environments/<環境名>
terraform plan
terraform apply
# githubに公開鍵を登録
# OAuth 同意画面の設定
# 「APIとサービス」 > 「認証情報」 > 「ウェブ アプリケーション」
# 承認済みの JavaScript 生成元
# 承認済みのリダイレクト URI
# 秘密鍵をダブルクォートで囲ってコピーできるようにする
echo "./deploy.sh \"$(cat ~/.ssh/id_ed25519)\" GOOGLE_ID GOOGLE_SECRET WHISPER_KEY GEMINI_KEY"
# SSMでEC2にログイン
./deploy.sh
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
#### 1. 文字起こしディレクトリに移動
```sh
cd whisper
```

#### 2. ライブラリのインストール
```sh
pythonインストール
sudo apt install ffmpeg
sudo apt install nodejs
pip install -r requirements.txt
```

#### 3. API Keyの取得
whisperのAPI Keyを取得してください。  
https://whisperapi.com/

openaiのAPI Keyを取得してください。  
https://platform.openai.com/account/api-keys

#### 4. API Keyを環境変数に設定
.envを作成し、各環境変数に取得したAPI Keyを設定してください。
```sh
cp .env.example .env
touch youtube.list
```

#### 5. 文字起こししたい動画URL保存先ファイルを作成する
```sh
touch youtube.list
```

### Usage
#### 1. Youtubeの動画URLを記載する
文字起こししたい動画URLを`youtube.list`に記載してください。  
改行で複数指定もできます。

#### 2. 文字起こしを開始する
次のコマンドで文字起こしを開始します。
```sh
python main.py
```

#### 3. 実行結果を確認する
実行すると`output`ディレクトリに結果が出力されます。
```python
python main.py
tree -a output
  output
  └── ucn4jAPWBdQ                                   # Youtubeの動画ID
      ├── fixed_text.txt                            # 文字起こしテキストファイル
      └── raw_text.txt                               # 文字起こし中間データ
```

## nextjs
### Installation
```sh
cd nextjs
npx create-next-app@latest . --typescript --tailwind --eslint
```

### Usage
```sh
cd ~/tool-transcription
docker compose -f docker-compose.debug.yaml watch
code .
```

```sh
docker compose -f docker-compose.debug.yaml down -v
```
