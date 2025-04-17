# tests/test_postprocessing.py

from lexitra.postprocessing import postprocess_text

def test_postprocess_text():
    input_text = "번역 결과"
    # 현재 로직은 그대로 반환하므로 입력과 동일한 결과를 예상합니다.
    assert postprocess_text(input_text) == "번역 결과"