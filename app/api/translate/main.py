from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging
import os
import openai
from lexitra.tm import find_tm_match
from datetime import datetime
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env.local")

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("translate")

class TranslationRequest(BaseModel):
    text: str
    sourceLang: str
    targetLang: str

def calculate_similarity(a: str, b: str) -> float:
    """아주 단순한 유사도 계산 (단어 일치 기반 비율)"""
    set_a = set(a.lower().split())
    set_b = set(b.lower().split())
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)

client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.post("/")
async def translate_endpoint(request: TranslationRequest):
    logger.info("번역 요청 수신: %s", request)
    tm_result = find_tm_match(request.text, request.sourceLang, request.targetLang)

    # TM 매치가 있을 경우에만 반환
    if tm_result.get("match") and tm_result.get("target"):
        logger.info("✅ TM에서 결과 발견: %s", tm_result)
        return {"result": tm_result["target"], "fromTM": True}
    
    logger.info("🌀 TM 매치 없음. GPT를 사용할 예정입니다.")
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are a professional translator that translates from {request.sourceLang} to {request.targetLang}."},
                {"role": "user", "content": request.text}
            ]
        )
        logger.info("🧠 GPT 응답 전체: %s", response)
        gpt_translation = response.choices[0].message.content
        return {"result": gpt_translation.strip(), "fromTM": False}
    except Exception as e:
        logger.error("❌ GPT 번역 실패: %s", e)
        raise HTTPException(status_code=500, detail="GPT 번역 실패")