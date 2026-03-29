# ニュース分析ツール

ニュース記事のURLを入力するだけで、株式市場への影響を**4軸**で自動分析するWebアプリです。

## 機能

- ① **直接的影響** - プラス/マイナスになる業界・注目銘柄
- ② **統計的視点** - 過去の類似事例と市場反応パターン
- ③ **織り込み度チェック** - サプライズか織り込み済みかを判定
- ④ **連想ゲーム** - 一次→二次→三次の波及推論

## セットアップ

### 1. Gemini APIキーを取得

[Google AI Studio](https://aistudio.google.com/) でAPIキーを取得してください。

### 2. バックエンド起動

```bash
cd backend

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .env を編集して GEMINI_API_KEY を設定

# サーバー起動
uvicorn main:app --reload --port 8000
```

### 3. フロントエンド起動

```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# 必要に応じて NEXT_PUBLIC_API_URL を変更

# 開発サーバー起動
npm run dev
```

### 4. アクセス

ブラウザで http://localhost:3000 を開く

## デプロイ

- フロントエンド: [Vercel](https://vercel.com/) にデプロイ（`NEXT_PUBLIC_API_URL` にバックエンドURLを設定）
- バックエンド: [Render](https://render.com/) にデプロイ（`GEMINI_API_KEY` を環境変数に設定）

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 14 + TypeScript + Tailwind CSS |
| バックエンド | Python + FastAPI |
| スクレイピング | requests + BeautifulSoup4 |
| AI分析 | Google Gemini 2.0 Flash |
