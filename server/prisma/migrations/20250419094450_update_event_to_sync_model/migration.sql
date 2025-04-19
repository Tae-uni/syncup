/*
  Warnings:

  - You are about to drop the column `eventId` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `TimeOption` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `syncId` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syncId` to the `TimeOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_eventId_fkey";

-- DropForeignKey
ALTER TABLE "TimeOption" DROP CONSTRAINT "TimeOption_eventId_fkey";

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "eventId",
ADD COLUMN     "syncId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimeOption" DROP COLUMN "eventId",
ADD COLUMN     "syncId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Event";

-- CreateTable
CREATE TABLE "Sync" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeZone" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sync_expiresAt_idx" ON "Sync"("expiresAt");

-- AddForeignKey
ALTER TABLE "TimeOption" ADD CONSTRAINT "TimeOption_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "Sync"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "Sync"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
