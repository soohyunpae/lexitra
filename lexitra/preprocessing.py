# lexitra/preprocessing.py

def preprocess_text(text: str) -> str:
    """
    특허 문서에 맞게 텍스트 전처리를 수행합니다.
    예시) 앞뒤 공백 제거, 필요하다면 추가 전처리 로직 적용
    """
    processed_text = text.strip()  # 기본 전처리: 공백 제거
    # 예: 특수한 패턴을 정규화하거나 도메인별 용어 치환 추가 가능
    return processed_text