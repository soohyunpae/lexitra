import requests
from datetime import datetime
from lexitra.config import Config
from lexitra.logger import setup_logger
from lexitra.tm import lookup_translation_memory, save_to_tm

logger = setup_logger(__name__)


def translate_text(text: str, source_lang: str, target_lang: str) -> dict:
    """
    TM에서 먼저 결과를 조회한 후, 없으면 GPT API를 호출하여 번역한 후 TM에 저장합니다.
    항상 { "translation": <번역문>, "fromTM": <TM 매치 여부 (bool)> } 형태의 딕셔너리를 반환합니다.
    """
    try:
        # 1. TM 조회
        tm_result = lookup_translation_memory(text, source_lang, target_lang)
        if tm_result:
            logger.info("TM에서 결과 발견")
            return {"translation": tm_result, "fromTM": True}
        
        # 2. GPT API 호출
        prompt = (
            f"Translate the following {source_lang} text to {target_lang}. The translation should be precise and "
            "maintain the formal, technical, and legal tone of a patent document. "
            "Only return the translated text without quotes.\n\n"
            f"Text to be translated:\n{text}"
        )
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a highly specialized translation model trained for patent documents. "
                        "Provide an accurate, formal translation that preserves legal and technical terms, "
                        "and do not wrap the result in quotes."
                    )
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 100,
            "temperature": 0.3
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {Config.API_KEY}"
        }
        logger.info("GPT API 요청 payload: %s", payload)
        response = requests.post(Config.TRANSLATION_ENDPOINT, json=payload, headers=headers)
        logger.info("GPT API 응답 상태 코드: %s", response.status_code)
        logger.info("GPT API 응답 텍스트: %s", response.text)
        if response.status_code != 200:
            logger.error("API 요청 실패: 상태 코드 %s", response.status_code)
            return {"translation": "", "fromTM": False}
        data = response.json()
        logger.info("GPT API 응답 데이터: %s", data)
        translated = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not translated:
            logger.error("GPT API에서 번역된 텍스트가 비어 있습니다.")
            translated = "[번역 실패]"
        # 3. TM 저장
        save_to_tm({
            "source": text,
            "target": translated,
            "sourceLang": source_lang,
            "targetLang": target_lang,
            "updatedAt": datetime.utcnow().isoformat()
        })
        logger.info("새 번역 결과가 TM에 저장되었습니다.")
        return {"translation": translated, "fromTM": False}
    except Exception as e:
        logger.exception("번역 도중 예외 발생:")
        return {"translation": "", "fromTM": False}