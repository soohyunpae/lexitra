from dotenv import load_dotenv
import os

# .env.local 파일을 명시적으로 불러옵니다.
load_dotenv('.env.local')

class Config:
    API_KEY = os.getenv("OPENAI_API_KEY")
    TRANSLATION_ENDPOINT = os.getenv("TRANSLATION_ENDPOINT", "https://api.openai.com/v1/chat/completions")
    # 추가 설정이 필요한 경우 여기서 정의하세요.