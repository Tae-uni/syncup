/*
  Warnings:

  - Added the required column `hashedPasscode` to the `Sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sync" ADD COLUMN     "hashedPasscode" TEXT NOT NULL;
