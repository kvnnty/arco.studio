-- Credit ledger and balance fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "includedCreditsBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "purchasedCreditsBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "reservedCreditsBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsPeriodStart" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsPeriodEnd" TIMESTAMP(3);

ALTER TABLE "RenderJob" ADD COLUMN IF NOT EXISTS "creditReservationId" TEXT;

CREATE TABLE IF NOT EXISTS "CreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "amount" INTEGER NOT NULL,
    "balanceType" TEXT,
    "actionType" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "parentReservationId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "settledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditLedgerEntry_idempotencyKey_key" ON "CreditLedgerEntry"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_userId_createdAt_idx" ON "CreditLedgerEntry"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_userId_status_idx" ON "CreditLedgerEntry"("userId", "status");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_referenceType_referenceId_idx" ON "CreditLedgerEntry"("referenceType", "referenceId");

ALTER TABLE "CreditLedgerEntry" DROP CONSTRAINT IF EXISTS "CreditLedgerEntry_userId_fkey";
ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
