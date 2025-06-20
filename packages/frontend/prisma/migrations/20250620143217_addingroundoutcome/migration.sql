/*
  Warnings:

  - You are about to drop the column `shownMembers` on the `PayOut` table. All the data in the column will be lost.
  - Made the column `receiver` on table `PayOut` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PayOut" DROP COLUMN "shownMembers",
ALTER COLUMN "txHash" DROP NOT NULL,
ALTER COLUMN "receiver" SET NOT NULL;

-- CreateTable
CREATE TABLE "roundOutcome" (
    "id" SERIAL NOT NULL,
    "disburse" BOOLEAN NOT NULL,
    "chamaCycle" INTEGER NOT NULL,
    "chamaRound" INTEGER NOT NULL,
    "amountPaid" TEXT NOT NULL,
    "shownMembers" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamaId" INTEGER NOT NULL,

    CONSTRAINT "roundOutcome_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "roundOutcome" ADD CONSTRAINT "roundOutcome_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
