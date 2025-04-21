/*
  Warnings:

  - You are about to drop the column `dummyField` on the `TranslationMemory` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TranslationMemory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MT',
    "projectName" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "comment" TEXT
);
INSERT INTO "new_TranslationMemory" ("comment", "id", "projectName", "source", "sourceLang", "status", "target", "targetLang", "updatedAt") SELECT "comment", "id", "projectName", "source", "sourceLang", "status", "target", "targetLang", "updatedAt" FROM "TranslationMemory";
DROP TABLE "TranslationMemory";
ALTER TABLE "new_TranslationMemory" RENAME TO "TranslationMemory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
