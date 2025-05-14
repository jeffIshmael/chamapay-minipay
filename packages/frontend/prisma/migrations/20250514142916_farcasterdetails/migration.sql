/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "fid" INTEGER,
ADD COLUMN     "isFarcaster" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "url" TEXT;
