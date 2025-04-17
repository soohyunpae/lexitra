from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from lexitra.tm import save_tm_entry
from datetime import datetime
import asyncio

app = FastAPI()

class TMEntry(BaseModel):
    source: str
    target: str
    sourceLang: str
    targetLang: str
    updatedAt: str

class TMUpdateRequest(BaseModel):
    entries: List[TMEntry]

@app.post("/")
async def update_tm(request: TMUpdateRequest):
    """
    TM에 새로운 번역 항목을 추가합니다.
    """
    try:
        for entry in request.entries:
            await save_tm_entry({
                "source": entry.source,
                "target": entry.target,
                "sourceLang": entry.sourceLang,
                "targetLang": entry.targetLang,
                "updatedAt": entry.updatedAt or datetime.utcnow().isoformat()
            })
        return {"status": "ok"}
    except Exception as e:
        print("TM 업데이트 중 에러 발생:", e)
        raise HTTPException(status_code=500, detail="TM 업데이트 실패")