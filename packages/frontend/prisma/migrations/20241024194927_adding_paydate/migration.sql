/*
  Warnings:

  - Added the required column `payDate` to the `ChamaMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add the payDate column with a temporary default value (current date, for example)
ALTER TABLE "ChamaMember" ADD COLUMN "payDate" TIMESTAMP NOT NULL DEFAULT NOW();

-- If you want to drop the default constraint afterward (optional):
ALTER TABLE "ChamaMember" ALTER COLUMN "payDate" DROP DEFAULT;

