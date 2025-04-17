# lexitra/logger.py
import logging

def setup_logger(name=__name__, level=logging.INFO):
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    # 중복 핸들러 추가 방지
    if not logger.handlers:
        logger.addHandler(handler)
    return logger