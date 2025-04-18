from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from lexitra.db import get_db
from lexitra.logger import setup_logger

logger = setup_logger(__name__)
app = FastAPI()

@app.get("/")
async def search_tm(
    query: str = Query(""),
    sourceLang: str = Query("ko"),
    targetLang: str = Query("en")
):
    logger.info("TM 검색 엔드포인트 호출됨 - 검색어: '%s'", query)
    db = get_db()
    query_str = query.strip().lower()

    if not query_str:
        return JSONResponse(content={"results": []})

    try:
        results = db.execute(
            """
            SELECT source, target, sourceLang, targetLang, updatedAt, status
            FROM TranslationMemory
            WHERE sourceLang = :sourceLang
              AND targetLang = :targetLang
              AND (LOWER(source) LIKE :query OR LOWER(target) LIKE :query)
            """,
            {
                "sourceLang": sourceLang,
                "targetLang": targetLang,
                "query": f"%{query_str}%"
            }
        ).fetchall()

        output = [
            {
                "source": row[0],
                "target": row[1],
                "sourceLang": row[2],
                "targetLang": row[3],
                "updatedAt": row[4],
                "status": row[5]
            }
            for row in results
        ]

        logger.info("검색 결과: %s", output)
        return output
    except Exception as e:
        logger.error("DB 검색 오류: %s", e)
        return JSONResponse(content={"error": "DB 검색 실패"}, status_code=500)