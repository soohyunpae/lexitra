/*
  Warnings:

  - A unique constraint covering the columns `[source,target,sourceLang,targetLang]` on the table `TMEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TMEntry_source_target_sourceLang_targetLang_key" ON "TMEntry"("source", "target", "sourceLang", "targetLang");
