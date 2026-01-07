FROM node:22-slim

# Python と 必要なツールをインストール
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && apt-get clean

WORKDIR /app

# Pythonの依存関係をインストール
COPY whisper/requirements.txt ./whisper/
RUN pip3 install --no-cache-dir -r ./whisper/requirements.txt --break-system-packages

# Next.jsの依存関係をインストール
COPY nextjs/package*.json ./nextjs/
RUN cd nextjs && npm install

# アプリケーションコードのコピー
COPY . .

EXPOSE 3000
# デフォルトは本番起動。Compose側で上書き可能。
CMD ["npm", "--prefix", "nextjs", "start"]
