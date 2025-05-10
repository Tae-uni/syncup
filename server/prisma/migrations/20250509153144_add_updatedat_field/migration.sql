/*
  Warnings:

  - Added the required column `updatedAt` to the `Sync` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TimeOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sync" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TimeOption" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TimeOption_syncId_date_idx" ON "TimeOption"("syncId", "date");

-- CreateIndex
CREATE INDEX "Vote_timeOptionId_idx" ON "Vote"("timeOptionId");
