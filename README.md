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
export TF_VAR_google_id="<GOOGLE_CLIENT_ID>"
export TF_VAR_google_secret="<GOOGLE_CLIENT_SECRET>"
export TF_VAR_whisper_key="<WHISPER_API_KEY>"
export TF_VAR_gemini_key="<GEMINI_API_KEY>"
export TF_VAR_allowed_emails="<ALLOWED_EMAILS(test1@exaqmple.com,test2@example.com)>"
terraform plan
terraform apply --auto-approve

# SSMでEC2にログイン
sudo dnf install -y docker git
sudo systemctl start docker
sudo systemctl enable docker

# Docker Compose V2 インストール
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
mkdir -p ~/.ssh
chmod 400 ~/.ssh/id_ed25519
mkdir -p ~/app && cd ~/app
git clone git@github.com:nagineko/tool-transcription.git .
mkdir -p ~/app/whisper/output

# 1. トークンを発行（6時間有効）
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# 2. トークンを使ってIPを取得
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)

cat <<EOT > nextjs/.env
GOOGLE_CLIENT_ID="<GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<GOOGLE_CLIENT_SECRET>"
NEXTAUTH_URL=https://ultive.info
NEXTAUTH_SECRET=$(openssl rand -base64 32)
WHISPER_API_KEY="<WHISPER_API_KEY>"
GEMINI_API_KEY="<GEMINI_API_KEY>"
ALLOWED_EMAILS="<ALLOWED_EMAILS(test1@exaqmple.com,test2@example.com)>"
EOT

# 1. プラグイン用のディレクトリを作成
mkdir -p ~/.docker/cli-plugins/

# 2. Buildx の最新バイナリをダウンロード (t4g/ARM64用)
curl -SL https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-arm64 -o ~/.docker/cli-plugins/docker-buildx

# 3. 実行権限を付与
chmod +x ~/.docker/cli-plugins/docker-buildx

# 4. 確認 (バージョンが表示されればOK)
docker buildx version

# 5. システム全体のプラグインディレクトリを作成
sudo mkdir -p /usr/local/lib/docker/cli-plugins/
# 6. 先ほどダウンロードしたファイルを共通場所にコピー
sudo cp ~/.docker/cli-plugins/docker-buildx /usr/local/lib/docker/cli-plugins/

# 拡張機能「Get cookies.txt LOCALLY） > Export > 生成されるファイルをリネーム（youtube_cookies.txt）
# youtube_cookies.txtをwhisper/youtube_cookies.txtに配置
sudo docker compose up -d --build

# お名前.comでドメインを用意する
# OAuth 同意画面の設定
# 「APIとサービス」 > 「認証情報」 > 「ウェブ アプリケーション」
# 承認済みの JavaScript 生成元
# 承認済みのリダイレクト URI
```

```sh
sudo docker compose down
```


### EC2アプリケーションコード更新方法
```sh
sudo docker system df
sudo docker system prune --volumes
sudo rm -rf ~/app
git clone git@github.com:nagineko/tool-transcription.git .
mkdir -p ~/app/whisper/output
cat <<EOT > nextjs/.env
GOOGLE_CLIENT_ID="<GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<GOOGLE_CLIENT_SECRET>"
NEXTAUTH_URL=https://ultive.info
NEXTAUTH_SECRET=$(openssl rand -base64 32)
WHISPER_API_KEY="<WHISPER_API_KEY>"
GEMINI_API_KEY="<GEMINI_API_KEY>"
ALLOWED_EMAILS="<ALLOWED_EMAILS(test1@exaqmple.com,test2@example.com)>"
EOT
```


```sh
terraform destroy --auto-approve
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
code .
docker compose -f docker-compose.local.yaml watch

yt-dlp --cookies /app/whisper/youtube_cookies.txt \
  --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36" \
  --js-runtime node \
  --remote-components ejs:github \
  --cache-dir /tmp/yt-dlp-cache \
  "https://www.youtube.com/shorts/BxDyDtU108c"
```

```sh
docker compose -f docker-compose.local.yaml down -v
```
