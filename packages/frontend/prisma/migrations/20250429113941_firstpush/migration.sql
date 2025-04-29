-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chama" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "cycleTime" INTEGER NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "amount" BIGINT NOT NULL,
    "round" INTEGER NOT NULL,
    "cycle" INTEGER NOT NULL,
    "maxNo" INTEGER NOT NULL,
    "blockchainId" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "payOutOrder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamaMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "chamaId" INTEGER NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChamaMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "chamaId" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "chamaId" INTEGER,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamaRequest" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "chamaId" INTEGER NOT NULL,

    CONSTRAINT "ChamaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "chamaId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayOut" (
    "id" SERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT,
    "receiver" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "chamaId" INTEGER NOT NULL,

    CONSTRAINT "PayOut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Chama_slug_key" ON "Chama"("slug");

-- AddForeignKey
ALTER TABLE "Chama" ADD CONSTRAINT "Chama_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamaMember" ADD CONSTRAINT "ChamaMember_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamaMember" ADD CONSTRAINT "ChamaMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamaRequest" ADD CONSTRAINT "ChamaRequest_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamaRequest" ADD CONSTRAINT "ChamaRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayOut" ADD CONSTRAINT "PayOut_chamaId_fkey" FOREIGN KEY ("chamaId") REFERENCES "Chama"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayOut" ADD CONSTRAINT "PayOut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
