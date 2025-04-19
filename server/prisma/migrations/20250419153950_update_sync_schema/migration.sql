/*
  Warnings:

  - Made the column `timeZone` on table `Sync` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `date` to the `TimeOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_syncId_fkey";

-- DropForeignKey
ALTER TABLE "TimeOption" DROP CONSTRAINT "TimeOption_syncId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_participantId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_timeOptionId_fkey";

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Sync" ALTER COLUMN "timeZone" SET NOT NULL,
ALTER COLUMN "timeZone" SET DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "TimeOption" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdByParticipantId" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "TimeOption" ADD CONSTRAINT "TimeOption_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "Sync"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOption" ADD CONSTRAINT "TimeOption_createdByParticipantId_fkey" FOREIGN KEY ("createdByParticipantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "Sync"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_timeOptionId_fkey" FOREIGN KEY ("timeOptionId") REFERENCES "TimeOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
