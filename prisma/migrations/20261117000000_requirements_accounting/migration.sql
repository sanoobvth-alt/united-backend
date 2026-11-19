CREATE TYPE "CustomerCategory" AS ENUM ('UNITED_PARTY', 'THIRD_PARTY');
CREATE TYPE "InsuranceClass" AS ENUM ('FIRST_CLASS', 'THIRD_PARTY');
CREATE TYPE "AccountEntryType" AS ENUM ('CHARGE', 'PAYMENT', 'CREDIT');
CREATE TYPE "ClosingStatus" AS ENUM ('DRAFT', 'SUBMITTED');

ALTER TABLE "Customer"
ADD COLUMN "category" "CustomerCategory";

ALTER TABLE "Policy"
ADD COLUMN "insuranceClass" "InsuranceClass",
ADD COLUMN "vehicleNumber" TEXT,
ADD COLUMN "vehicleType" TEXT,
ADD COLUMN "vehicleDetails" TEXT,
ADD COLUMN "amountPartOne" DECIMAL(12,2),
ADD COLUMN "amountPartTwo" DECIMAL(12,2);

CREATE TABLE "AccountEntry" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "policyId" UUID,
    "type" "AccountEntryType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyClosing" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "closingDate" DATE NOT NULL,
    "openingBalance" DECIMAL(12,2),
    "cashReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bankReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expensesPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "closingBalanceDeclared" DECIMAL(12,2),
    "notes" TEXT,
    "status" "ClosingStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyClosing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InsuranceSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "thirdPartyFixedAmount" DECIMAL(12,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InsuranceSettings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountEntry_branchId_occurredAt_idx" ON "AccountEntry"("branchId", "occurredAt");
CREATE INDEX "AccountEntry_customerId_occurredAt_idx" ON "AccountEntry"("customerId", "occurredAt");
CREATE INDEX "AccountEntry_policyId_idx" ON "AccountEntry"("policyId");
CREATE INDEX "Expense_branchId_expenseDate_idx" ON "Expense"("branchId", "expenseDate");
CREATE UNIQUE INDEX "DailyClosing_branchId_closingDate_key" ON "DailyClosing"("branchId", "closingDate");
CREATE INDEX "DailyClosing_closingDate_status_idx" ON "DailyClosing"("closingDate", "status");

ALTER TABLE "AccountEntry" ADD CONSTRAINT "AccountEntry_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountEntry" ADD CONSTRAINT "AccountEntry_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountEntry" ADD CONSTRAINT "AccountEntry_policyId_fkey"
FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyClosing" ADD CONSTRAINT "DailyClosing_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
