-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TranslationMemory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MT'
);
INSERT INTO "new_TranslationMemory" ("id", "source", "sourceLang", "target", "targetLang", "updatedAt") SELECT "id", "source", "sourceLang", "target", "targetLang", "updatedAt" FROM "TranslationMemory";
DROP TABLE "TranslationMemory";
ALTER TABLE "new_TranslationMemory" RENAME TO "TranslationMemory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
