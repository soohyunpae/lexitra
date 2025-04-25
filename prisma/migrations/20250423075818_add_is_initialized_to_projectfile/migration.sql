-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER NOT NULL,
    "isInitialized" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjectFile" ("content", "createdAt", "filename", "id", "projectId") SELECT "content", "createdAt", "filename", "id", "projectId" FROM "ProjectFile";
DROP TABLE "ProjectFile";
ALTER TABLE "new_ProjectFile" RENAME TO "ProjectFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
