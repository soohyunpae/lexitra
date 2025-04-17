

import sqlite3
import os

# Ensure the database directory exists
db_dir = os.path.join("app", "database")
os.makedirs(db_dir, exist_ok=True)

# Path to the SQLite database
db_path = os.path.join(db_dir, "translation_memory.db")

# Connect to the database (it will be created if it doesn't exist)
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create the TranslationMemory table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS TranslationMemory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    sourceLang TEXT NOT NULL,
    targetLang TEXT NOT NULL,
    updatedAt TEXT NOT NULL
)
""")

# Optional: Insert sample data
sample_data = [
    ("안녕하세요.", "Hello.", "ko", "en", "2025-04-17T10:00:00Z"),
    ("이것은 테스트입니다.", "This is a test.", "ko", "en", "2025-04-17T10:01:00Z"),
]

cursor.executemany("""
INSERT INTO TranslationMemory (source, target, sourceLang, targetLang, updatedAt)
VALUES (?, ?, ?, ?, ?)
""", sample_data)

# Commit and close
conn.commit()
conn.close()

print("TranslationMemory table created and sample data inserted.")