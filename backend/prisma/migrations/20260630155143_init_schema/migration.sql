-- CreateTable
CREATE TABLE "CustomerIdentity" (
    "id" TEXT NOT NULL,
    "currentName" TEXT NOT NULL,
    "kycTier" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityEvent" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualAccount" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL DEFAULT 'Nomba',
    "identityId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectedPayment" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "expectedAmount" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpectedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "virtualAccountId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAccountNumber" TEXT,
    "narration" TEXT,
    "reference" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'unmatched',

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationMatch" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "expectedPaymentId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "amountScore" DOUBLE PRECISION NOT NULL,
    "nameScore" DOUBLE PRECISION NOT NULL,
    "timingScore" DOUBLE PRECISION NOT NULL,
    "historyScore" DOUBLE PRECISION NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'pending',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdentityEvent_identityId_createdAt_idx" ON "IdentityEvent"("identityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccount_accountNumber_key" ON "VirtualAccount"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_reference_key" ON "Transfer"("reference");

-- CreateIndex
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");

-- CreateIndex
CREATE INDEX "ReconciliationMatch_transferId_idx" ON "ReconciliationMatch"("transferId");

-- CreateIndex
CREATE INDEX "ReconciliationMatch_decision_idx" ON "ReconciliationMatch"("decision");

-- AddForeignKey
ALTER TABLE "IdentityEvent" ADD CONSTRAINT "IdentityEvent_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CustomerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CustomerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedPayment" ADD CONSTRAINT "ExpectedPayment_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "CustomerIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_virtualAccountId_fkey" FOREIGN KEY ("virtualAccountId") REFERENCES "VirtualAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationMatch" ADD CONSTRAINT "ReconciliationMatch_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationMatch" ADD CONSTRAINT "ReconciliationMatch_expectedPaymentId_fkey" FOREIGN KEY ("expectedPaymentId") REFERENCES "ExpectedPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
