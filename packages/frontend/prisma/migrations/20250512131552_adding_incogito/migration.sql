-- AlterTable
ALTER TABLE "Chama" ADD COLUMN     "canJoin" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ChamaMember" ADD COLUMN     "incognito" BOOLEAN NOT NULL DEFAULT false;
