# main.py

import sys
from lexitra.preprocessing import preprocess_text
from lexitra.translation import translate_text
from lexitra.postprocessing import postprocess_text

def main():
    if len(sys.argv) < 2:
        print("번역할 텍스트를 인자로 입력해 주세요.")
        sys.exit(1)
    
    input_text = sys.argv[1]
    
    # 단계별 처리
    preprocessed = preprocess_text(input_text)
    translated = translate_text(preprocessed)
    final_text = postprocess_text(translated)
    
    print("번역 결과:")
    print(final_text)

if __name__ == "__main__":
    main()