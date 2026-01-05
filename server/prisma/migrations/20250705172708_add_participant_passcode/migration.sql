/*
  Warnings:

  - A unique constraint covering the columns `[syncId,name]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedPasscode` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "hashedPasscode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Participant_syncId_name_key" ON "Participant"("syncId", "name");
