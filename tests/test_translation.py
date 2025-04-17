# tests/test_translation.py

import pytest
from lexitra.translation import translate_text

def dummy_post(url, json):
    class DummyResponse:
        status_code = 200
        def json(self):
            return {"translated_text": "테스트 번역"}
    return DummyResponse()

def test_translate_text(monkeypatch):
    monkeypatch.setattr("requests.post", dummy_post)
    result = translate_text("Test")
    assert result == "테스트 번역"