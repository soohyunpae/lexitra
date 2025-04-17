import sqlite3

DB_PATH = "app/database/translation_memory.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Compatibility alias
get_db = get_db_connection