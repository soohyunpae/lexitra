-- CreateTable
CREATE TABLE "TranslationMemory" (
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
