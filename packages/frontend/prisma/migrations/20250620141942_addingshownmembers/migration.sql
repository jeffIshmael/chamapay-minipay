/*
  Warnings:

  - Made the column `txHash` on table `PayOut` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PayOut" ADD COLUMN     "shownMembers" TEXT,
ALTER COLUMN "txHash" SET NOT NULL,
ALTER COLUMN "receiver" DROP NOT NULL;
