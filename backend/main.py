import os
import json
import re
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="ニュース分析ツール API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3006", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class AnalyzeRequest(BaseModel):
    url: str | None = None
    text: str | None = None


class AnalyzeTextRequest(BaseModel):
    text: str


SYSTEM_PROMPT = """あなたは株式市場の影響分析の専門家であり、初心者向けに解説するアシスタントです。

以下のニュース記事を4軸で分析し、必ず下記のJSON形式のみで出力してください。
JSONの前後に余計なテキストや```json```などのマークダウン記法は一切付けないでください。

出力ルール:
- 出力はJSON形式で固定（フロントで整形して表示）
- 推論ベースの情報と事実ベースの情報を明確に区別して記載すること
- 専門用語には必ず（）で補足説明を付けること
- 知識カットオフ（2025年初頭）以降の情報が必要な場合は「最新情報の確認を推奨」と明記すること
- 4軸の分析を必ずすべて出力すること

出力JSONスキーマ:
{
  "articleSummary": {
    "title": "記事タイトル",
    "media": "メディア名",
    "summary": "3行要約（改行区切り）"
  },
  "directImpact": {
    "positiveIndustries": [
      { "name": "業界名", "reason": "理由", "magnitude": "大/中/小", "timeframe": "短期/中期/長期" }
    ],
    "negativeIndustries": [
      { "name": "業界名", "reason": "理由", "magnitude": "大/中/小", "timeframe": "短期/中期/長期" }
    ],
    "notableStocks": [
      { "name": "銘柄名", "code": "証券コード（例:7203）", "direction": "プラス/マイナス", "reason": "理由" }
    ],
    "beginnerNote": "初心者向け解説（なぜその業界に影響するかをやさしい言葉で）"
  },
  "statisticalView": {
    "similarCases": "過去の類似事例説明",
    "reactionPattern": "市場反応パターン（例：発表直後は上昇するが3日後に反落する傾向がある）",
    "caveat": "今回との差異・注意点",
    "confidence": "高/中/低"
  },
  "pricingCheck": {
    "verdict": "サプライズ/一部織り込み/織り込み済み",
    "reasoning": "判定根拠",
    "priceImplication": "株価への期待値コメント",
    "beginnerNote": "「織り込み済み」という概念をやさしく説明"
  },
  "associationGame": {
    "primary": [{ "industry": "業界", "reason": "理由" }],
    "secondary": [{ "industry": "業界", "reason": "理由" }],
    "tertiary": [{ "industry": "業界", "reason": "理由" }],
    "story": "連想ストーリーの全体説明（一次→二次→三次の流れをわかりやすく）"
  }
}
"""


def scrape_article(url: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        response.encoding = response.apparent_encoding

        soup = BeautifulSoup(response.text, "lxml")

        # 不要な要素を除去
        for tag in soup(["script", "style", "nav", "header", "footer", "aside", "advertisement", "iframe"]):
            tag.decompose()

        # タイトル取得
        title = ""
        if soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)
        elif soup.find("title"):
            title = soup.find("title").get_text(strip=True)

        # 本文取得（article タグ優先、なければ body）
        article_tag = soup.find("article")
        if article_tag:
            text = article_tag.get_text(separator="\n", strip=True)
        else:
            # main タグ、または div[class*="content/article/body"] を探す
            main_tag = soup.find("main") or soup.find("div", class_=re.compile(r"(content|article|body|text|story)", re.I))
            if main_tag:
                text = main_tag.get_text(separator="\n", strip=True)
            else:
                text = soup.get_text(separator="\n", strip=True)

        # 空行を整理
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        text = "\n".join(lines)

        # 長すぎる場合は先頭5000文字に切り詰める
        if len(text) > 5000:
            text = text[:5000] + "...(以下省略)"

        return {"title": title, "text": text, "success": True}

    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status in [403, 401, 402]:
            raise HTTPException(
                status_code=422,
                detail="ペイウォール（有料会員限定記事）のため取得できませんでした。記事テキストを直接貼り付けてください。"
            )
        if status == 404:
            raise HTTPException(status_code=422, detail="記事が見つかりませんでした（404）。URLを確認してください。")
        raise HTTPException(status_code=422, detail=f"記事の取得に失敗しました（{status}）: {str(e)}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=422, detail="記事の取得がタイムアウトしました。URLを確認するか、テキストを直接貼り付けてください。")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"記事の取得に失敗しました: {str(e)}")


MOCK_RESULT = {
    "articleSummary": {
        "title": "【テストデータ】日本銀行、政策金利を0.75%に引き上げ",
        "media": "テスト配信",
        "summary": "日本銀行は金融政策決定会合で政策金利を0.5%から0.75%に引き上げた。\n2025年以来2度目の利上げとなり、円相場は142円台に上昇した。\n植田総裁は「物価目標の達成に向けて前進している」と述べた。"
    },
    "directImpact": {
        "positiveIndustries": [
            {"name": "銀行・金融", "reason": "金利上昇により利ざや（貸出金利と預金金利の差）が拡大し、収益改善が期待される", "magnitude": "大", "timeframe": "短期"},
            {"name": "保険", "reason": "運用資産の利回りが改善し、長期的な収益向上が見込まれる", "magnitude": "中", "timeframe": "中期"}
        ],
        "negativeIndustries": [
            {"name": "不動産・REIT", "reason": "金利上昇により借入コストが増加し、物件価値の下押し圧力となる", "magnitude": "大", "timeframe": "短期"},
            {"name": "輸出製造業", "reason": "円高進行により海外売上の円換算額が減少する", "magnitude": "中", "timeframe": "短期"},
            {"name": "ハイテク・グロース株", "reason": "将来キャッシュフローの割引率上昇でバリュエーション（企業価値評価）が低下", "magnitude": "中", "timeframe": "中期"}
        ],
        "notableStocks": [
            {"name": "三菱UFJフィナンシャル・グループ", "code": "8306", "direction": "プラス", "reason": "メガバンクは利上げの最大受益者。貸出残高が多く利ざや拡大の恩恵が大きい"},
            {"name": "三井住友フィナンシャルグループ", "code": "8316", "direction": "プラス", "reason": "同上。国内貸出比率が高くリテート部門での収益改善が見込まれる"},
            {"name": "三井不動産", "code": "8801", "direction": "マイナス", "reason": "大型開発案件を多数抱え、借入コスト増加の影響を受けやすい"},
            {"name": "トヨタ自動車", "code": "7203", "direction": "マイナス", "reason": "円高進行で北米など海外販売の円換算収益が減少する"},
            {"name": "ソフトバンクグループ", "code": "9984", "direction": "マイナス", "reason": "多額の有利子負債を抱えており、金利上昇で財務費用が増加する"}
        ],
        "beginnerNote": "金利が上がると「お金を貸す側（銀行）」は儲かりますが、「お金を借りる側（不動産会社や借金の多い企業）」はコストが増えます。また円高になるとトヨタのような輸出企業は、海外で稼いだドルを円に換えたとき目減りするため不利になります。"
    },
    "statisticalView": {
        "similarCases": "2006〜2007年の日銀利上げ局面では、メガバンク株が利上げ発表前後の1ヶ月で平均+8〜12%上昇した一方、REITインデックスは同期間で-5〜8%下落した実績があります。2024年3月のマイナス金利解除時も銀行株が短期的に強含む展開となりました。",
        "reactionPattern": "利上げ発表直後は「円高・銀行株高・不動産株安」のトリプル反応が起きやすい傾向があります。ただし「事前に報道で織り込まれていた場合」は発表後に株価が反落する『噂で買って事実で売る』パターンも多く見られます。",
        "caveat": "今回は0.25%の小幅利上げである点、米国経済の先行き不透明感が高い点が過去との相違点です。過去の利上げ局面より市場の反応が穏やかになる可能性があります。",
        "confidence": "高"
    },
    "pricingCheck": {
        "verdict": "一部織り込み",
        "reasoning": "3〜4週間前から日経新聞やロイターが「3月利上げ観測」を報道しており、市場参加者の間では50〜60%程度の確率で利上げが折り込まれていたと見られます。ただし今回の発表で確定したため、残り40〜50%の「サプライズ」成分が株価・為替を動かすと考えられます。",
        "priceImplication": "完全に織り込み済みではないため、発表直後は銀行株の上昇・不動産株の下落が見込まれます。ただし上昇幅は限定的で、翌週以降は次の利上げ時期を巡る思惑相場に移行する可能性が高いです。",
        "beginnerNote": "「織り込み済み」とは、ニュースが出る前にすでに株価が動いてしまっている状態のことです。例えば「明日決算発表で好業績」という噂が広まれば、発表前に株が買われます。実際に好決算が発表されても『もう知ってた』として株価が下がることがあります。これを『噂で買って事実で売る』と言います。"
    },
    "associationGame": {
        "primary": [
            {"industry": "銀行・証券", "reason": "利ざや拡大による直接的な収益改善"},
            {"industry": "為替市場（円高）", "reason": "日米金利差縮小により円が買われやすくなる"}
        ],
        "secondary": [
            {"industry": "インバウンド関連（観光・小売）", "reason": "円高で訪日外国人の購買力が相対的に低下し、消費額が減少する可能性"},
            {"industry": "輸入関連企業（食品・エネルギー）", "reason": "円高で輸入コストが低下し、食品・電力会社などのコスト削減につながる"}
        ],
        "tertiary": [
            {"industry": "食品・飲料メーカー", "reason": "輸入原材料コスト低下により原価改善→値下げ余地または利益率向上"},
            {"industry": "電力・ガス会社", "reason": "LNG（液化天然ガス）の輸入コスト低下で電気代値下げ圧力が和らぐ"}
        ],
        "story": "日銀利上げ→円高進行（一次）→輸入コスト低下で食品・エネルギー企業が恩恵、一方インバウンド消費は減速（二次）→食品メーカーは原価改善で利益率アップ、電力会社はLNGコスト低下（三次）という連鎖が生まれます。一見マイナスに見える円高も、輸入に頼る企業にとってはプラスに働くという逆説的な波及効果があります。"
    }
}


def analyze_with_gemini(article_title: str, article_text: str) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY が設定されていません")

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT
    )

    prompt = f"""以下のニュース記事を分析してください。

【記事タイトル】
{article_title}

【記事本文】
{article_text}
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=8192,
            )
        )
        raw_text = response.text.strip()

        # ```json ... ``` ブロックを除去
        code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
        if code_block_match:
            raw_text = code_block_match.group(1).strip()
        else:
            # コードブロックがなければ最初の { から最後の } を抽出
            json_match = re.search(r'\{[\s\S]*\}', raw_text)
            if json_match:
                raw_text = json_match.group()

        result = json.loads(raw_text)
        return result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AIの応答をJSONとして解析できませんでした: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini APIエラー: {str(e)}")


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.url and not request.text:
        raise HTTPException(status_code=400, detail="url または text のいずれかを指定してください")

    use_mock = os.getenv("USE_MOCK", "false").lower() == "true"
    if use_mock:
        return MOCK_RESULT

    article_title = ""
    article_text = ""

    if request.url:
        scraped = scrape_article(request.url)
        article_title = scraped["title"]
        article_text = scraped["text"]

        if not article_text or len(article_text) < 100:
            raise HTTPException(
                status_code=422,
                detail="記事本文を十分に取得できませんでした。テキストを直接貼り付けてください。"
            )
    else:
        article_text = request.text
        article_title = "（直接入力テキスト）"

    result = analyze_with_gemini(article_title, article_text)
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
