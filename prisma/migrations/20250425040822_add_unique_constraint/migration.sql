/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceLang,targetLang,projectId,fileId]` on the table `TranslationUnit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TranslationUnit_source_sourceLang_targetLang_projectId_fileId_key" ON "TranslationUnit"("source", "sourceLang", "targetLang", "projectId", "fileId");
