# app/main.py
from fastapi import FastAPI
from app.api.translate.main import app as translate_app
from app.api.check_tm.main import app as check_tm_app
from app.api.update_tm.main import app as update_tm_app
from app.api.search_tm.main import app as search_tm_app
from app.api.list_tm.main import app as list_tm_app
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/translate", translate_app)
app.mount("/check-tm", check_tm_app)
app.mount("/update-tm", update_tm_app)
app.mount("/search-tm", search_tm_app)
app.mount("/list-tm", list_tm_app)

@app.get("/")
async def root():
    return {"message": "Welcome to Lexitra API. Use /translate, /check-tm, /update-tm, or /search-tm."}