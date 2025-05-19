-- AlterTable
ALTER TABLE "Chama" ALTER COLUMN "maxNo" SET DEFAULT 15;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "divviReferred" BOOLEAN NOT NULL DEFAULT false;
