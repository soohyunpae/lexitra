# tests/test_preprocessing.py

from lexitra.preprocessing import preprocess_text

def test_preprocess_text():
    input_text = "  Example Text  "
    expected = "Example Text"
    assert preprocess_text(input_text) == expected