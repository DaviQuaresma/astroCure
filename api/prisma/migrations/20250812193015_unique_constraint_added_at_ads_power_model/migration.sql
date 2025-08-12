/*
  Warnings:

  - A unique constraint covering the columns `[endPoint]` on the table `AdsPower` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdsPower_endPoint_key" ON "AdsPower"("endPoint");
