from fastapi import FastAPI, HTTPException, APIRouter, Request
from pydantic import BaseModel
from typing import List, Optional
from lexitra.tm import save_tm_entry
from datetime import datetime
import asyncio

router = APIRouter()

class TMEntry(BaseModel):
    source: str
    target: str
    sourceLang: str
    targetLang: str
    updatedAt: Optional[str] = None
    status: str = "Approved"
    comment: str = ""

class TMUpdateRequest(BaseModel):
    entries: List[TMEntry]

@router.post("/update-tm/")
async def update_tm(request: Request):
    """
    TM에 새로운 번역 항목을 추가합니다.
    """
    body = await request.json()
    print("📦 실제 수신한 JSON:", body)
    try:
        for entry in body.get("entries", []):
            save_tm_entry(
                source=entry.get("source"),
                target=entry.get("target"),
                source_lang=entry.get("sourceLang"),
                target_lang=entry.get("targetLang"),
                comment=entry.get("comment"),
                status=entry.get("status")
            )
        return {"status": "ok"}
    except Exception as e:
        print("TM 업데이트 중 에러 발생:", e)
    raise HTTPException(status_code=500, detail="TM 업데이트 실패")