-- CreateTable
CREATE TABLE "TMEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "projectName" TEXT,
    "note" TEXT,
    "comment" TEXT,
    "updatedAt" DATETIME NOT NULL
);
