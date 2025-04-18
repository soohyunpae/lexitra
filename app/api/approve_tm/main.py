from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel
import sqlite3
import os

router = APIRouter()

DB_PATH = os.getenv("TM_DB_PATH", "app/database/translation_memory.db")

class ApproveRequest(BaseModel):
    source: str
    target: str
    sourceLang: str
    targetLang: str
    status: str
    comment: str = ""

app = FastAPI()
app.include_router(router)

@router.post("/approve-tm/")
def approve_tm_entry(request: ApproveRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE translation_memory
            SET status = ?, comment = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE source = ? AND target = ? AND sourceLang = ? AND targetLang = ?
            """,
            (request.status, request.comment, request.source, request.target, request.sourceLang, request.targetLang),
        )
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="TM entry not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

    return {"message": "TM entry approved successfully."}