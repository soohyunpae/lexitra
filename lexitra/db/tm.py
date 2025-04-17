# lexitra/db/tm.py
from prisma import PrismaClient
import difflib
from lexitra.logger import setup_logger

logger = setup_logger(__name__)
prisma = PrismaClient()

def normalize_text(text: str) -> str:
    # 기존 normalize_text 로직을 사용할 수 있음; 필요시 불러와서 사용.
    return text.strip().lower()

def calculate_similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()

async def get_all_tm_entries(source_lang: str, target_lang: str):
    # DB에서 모든 TM 항목을 가져옴
    await prisma.connect()
    entries = await prisma.translationmemory.find_many(
        where={
            "sourceLang": source_lang,
            "targetLang": target_lang,
        },
        orderBy={"updatedAt": "desc"}
    )
    await prisma.disconnect()
    return entries

async def find_tm_match(text: str, source_lang: str, target_lang: str) -> dict:
    """
    DB에서 TM 항목을 조회하여, 입력된 text와 가장 유사한 항목을 계산합니다.
    유사도가 특정 임계값(예: 0.85 이상)이면 해당 TM의 target을 반환합니다.
    """
    normalized_text = normalize_text(text)
    await prisma.connect()
    entries = await prisma.translationmemory.find_many(
        where={
            "sourceLang": source_lang,
            "targetLang": target_lang
        }
    )
    await prisma.disconnect()

    best_score = 0.0
    best_entry = None
    for entry in entries:
        # entry['source']는 Prisma에서 반환하는 dict의 field
        entry_source = normalize_text(entry.get("source", ""))
        score = calculate_similarity(normalized_text, entry_source)
        logger.info("비교: '%s' vs '%s' => 유사도: %.2f", normalized_text, entry_source, score)
        if score > best_score:
            best_score = score
            best_entry = entry

    if best_entry and best_score >= 0.85:
        logger.info("TM 매치 성공: score=%.2f, entry=%s", best_score, best_entry)
        return {"translation": best_entry.get("target", ""), "fromTM": True}
    else:
        logger.info("TM 매치 없음, 최고 유사도: %.2f", best_score)
        return {"translation": "", "fromTM": False}

async def save_tm_entry(record: dict) -> None:
    """
    DB에 기록을 업데이트하거나, 없으면 생성합니다.
    record는 {source, target, sourceLang, targetLang, updatedAt} 형태여야 합니다.
    """
    normalized_source = normalize_text(record["source"])
    await prisma.connect()
    # 먼저 기존 레코드를 업데이트 시도
    updated = await prisma.translationmemory.update_many(
        where={
            "source": normalized_source,
            "sourceLang": record["sourceLang"],
            "targetLang": record["targetLang"]
        },
        data={
            "target": record["target"],
            "updatedAt": record["updatedAt"]  # 기록된 값 또는 datetime.now() 등을 사용할 수 있음
        }
    )
    if updated["count"] == 0:
        # 업데이트할 레코드가 없으면 새로 생성
        await prisma.translationmemory.create({
            "data": {
                "source": normalized_source,
                "target": record["target"],
                "sourceLang": record["sourceLang"],
                "targetLang": record["targetLang"],
                "updatedAt": record["updatedAt"],
            }
        })
        logger.info("새 TM 항목 추가: %s", record)
    else:
        logger.info("기존 TM 항목 업데이트: %s", record)
    await prisma.disconnect()