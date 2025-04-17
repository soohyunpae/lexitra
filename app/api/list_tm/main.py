from fastapi import FastAPI
from lexitra.logger import setup_logger
import sqlite3

logger = setup_logger(__name__)
app = FastAPI()

@app.get("/")
async def list_tm():
    try:
        conn = sqlite3.connect("app/database/translation_memory.db")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, source, target, sourceLang, targetLang, updatedAt
            FROM TranslationMemory
            ORDER BY updatedAt DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        data = [
            {
                "id": row[0],
                "source": row[1],
                "target": row[2],
                "sourceLang": row[3],
                "targetLang": row[4],
                "updatedAt": row[5]
            }
            for row in rows
        ]
        return data
    except Exception as e:
        logger.error("SQLite에서 TM 데이터 로드 실패: %s", e)
        return []