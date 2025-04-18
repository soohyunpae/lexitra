from difflib import SequenceMatcher
from lexitra.logger import setup_logger
import unicodedata
import re
from lexitra.db import get_db_connection

logger = setup_logger(__name__)

def normalize_text(s: str) -> str:
    """
    문자열을 유니코드 NFC로 정규화하고,
    앞뒤 공백을 제거하며, 여러 공백은 단일 공백으로 변환합니다.
    """
    s = unicodedata.normalize("NFC", s)
    s = s.strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def find_tm_match(text: str, source_lang: str, target_lang: str) -> dict:
    """
    SQLite를 사용해 TM DB에서 sourceLang과 targetLang이 일치하는 항목을 조회하고,
    입력 텍스트와 유사도 비교를 수행한 후, 유사도가 0.7 이상인 경우 해당 target과 score를 반환합니다.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT source, target FROM TranslationMemory WHERE sourceLang=? AND targetLang=?",
        (source_lang, target_lang)
    )
    entries = cursor.fetchall()
    conn.close()

    normalized_text = normalize_text(text)
    best_match = None
    best_score = 0.0

    for entry in entries:
        ratio = SequenceMatcher(None, normalized_text, normalize_text(entry["source"])).ratio()
        logger.info("비교: '%s' vs '%s' => 유사도: %f", normalized_text, entry["source"], ratio)
        if ratio > best_score:
            best_score = ratio
            best_match = entry["target"]

    if best_score >= 0.7:
        logger.info("TM 매치 성공: score=%.2f, target=%s", best_score, best_match)
        return {"match": True, "score": round(best_score, 2), "target": best_match}
    else:
        logger.info("TM 매치 없음. 최고 유사도: %.2f", best_score)
        return {"match": False, "score": round(best_score, 2), "target": ""}

def save_tm_entry(source: str, target: str, source_lang: str, target_lang: str, comment: str = "", status: str = "MT") -> None:
    """
    번역 결과를 TM(SQLite DB)에 저장하는 함수입니다.
    동일한 source/sourceLang/targetLang 조합이 이미 존재하면 업데이트, 없으면 삽입합니다.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 기존 항목 존재 여부 확인
    cursor.execute("""
        SELECT id FROM TranslationMemory 
        WHERE source = ? AND sourceLang = ? AND targetLang = ?
    """, (source, source_lang, target_lang))
    existing = cursor.fetchone()

    if existing:
        # 기존 항목 업데이트
        cursor.execute("""
            UPDATE TranslationMemory 
            SET target = ?, updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (target, existing["id"]))
    else:
        # 새 항목 삽입 (status는 'MT'로 기본 설정)
        cursor.execute("""
            INSERT INTO TranslationMemory (source, target, sourceLang, targetLang, comment, status, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (source, target, source_lang, target_lang, comment, status))

    conn.commit()
    conn.close()