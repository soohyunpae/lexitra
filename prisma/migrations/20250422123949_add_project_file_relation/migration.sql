-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TranslationUnit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MT',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,
    "fileId" INTEGER,
    CONSTRAINT "TranslationUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TranslationUnit_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProjectFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TranslationUnit" ("comment", "createdAt", "id", "projectId", "source", "sourceLang", "status", "target", "targetLang") SELECT "comment", "createdAt", "id", "projectId", "source", "sourceLang", "status", "target", "targetLang" FROM "TranslationUnit";
DROP TABLE "TranslationUnit";
ALTER TABLE "new_TranslationUnit" RENAME TO "TranslationUnit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
