from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from lexitra.db import get_db
import sqlite3
from difflib import SequenceMatcher

app = FastAPI()

@app.get("/")
async def check_tm(
    text: str = Query(""),
    sourceLang: str = Query("ko"),
    targetLang: str = Query("en")
):
    if not text:
        return JSONResponse(content={"source": "", "target": "", "score": 0})

    normalized_text = text.strip()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT source, target FROM TranslationMemory WHERE sourceLang = ? AND targetLang = ?",
        (sourceLang, targetLang)
    )
    entries = cursor.fetchall()

    best_match = None
    best_score = 0.0
    for source_text, target_text in entries:
        ratio = SequenceMatcher(None, normalized_text, source_text.strip()).ratio()
        if ratio > best_score:
            best_score = ratio
            best_match = {"source": source_text, "target": target_text}

    if best_match and best_score >= 0.7:
        return JSONResponse(content={
            "source": best_match["source"],
            "target": best_match["target"],
            "score": round(best_score * 100)
        })
    else:
        return JSONResponse(content={"source": text, "target": "", "score": 0})