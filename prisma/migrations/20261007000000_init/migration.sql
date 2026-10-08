-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RenewalStatus" AS ENUM ('UPCOMING', 'DUE_SOON', 'DUE_TODAY', 'EXPIRED', 'RENEWED', 'NOT_RENEWED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "designation" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "joiningDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "staffId" UUID,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dob" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "staffId" UUID,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT,
    "interest" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "convertedCustomerId" UUID,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "insurer" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "policyType" TEXT NOT NULL,
    "premium" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Renewal" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "RenewalStatus" NOT NULL DEFAULT 'UPCOMING',
    "reminderStage" TEXT,
    "renewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Renewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "policyId" UUID,
    "claimNumber" TEXT,
    "claimDate" TIMESTAMP(3) NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'REPORTED',
    "amount" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID,
    "leadId" UUID,
    "staffId" UUID,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID,
    "policyId" UUID,
    "claimId" UUID,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "customerId" UUID,
    "staffId" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "policyId" UUID,
    "customerId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_username_key" ON "Branch"("username");

-- CreateIndex
CREATE INDEX "Branch_adminId_idx" ON "Branch"("adminId");

-- CreateIndex
CREATE INDEX "Branch_status_idx" ON "Branch"("status");

-- CreateIndex
CREATE INDEX "Staff_branchId_status_idx" ON "Staff"("branchId", "status");

-- CreateIndex
CREATE INDEX "Customer_branchId_name_idx" ON "Customer"("branchId", "name");

-- CreateIndex
CREATE INDEX "Customer_branchId_phone_idx" ON "Customer"("branchId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_convertedCustomerId_key" ON "Lead"("convertedCustomerId");

-- CreateIndex
CREATE INDEX "Lead_branchId_status_idx" ON "Lead"("branchId", "status");

-- CreateIndex
CREATE INDEX "Policy_branchId_expiryDate_idx" ON "Policy"("branchId", "expiryDate");

-- CreateIndex
CREATE INDEX "Policy_customerId_idx" ON "Policy"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_branchId_policyNumber_key" ON "Policy"("branchId", "policyNumber");

-- CreateIndex
CREATE INDEX "Renewal_branchId_dueDate_status_idx" ON "Renewal"("branchId", "dueDate", "status");

-- CreateIndex
CREATE INDEX "Claim_branchId_status_idx" ON "Claim"("branchId", "status");

-- CreateIndex
CREATE INDEX "Claim_customerId_idx" ON "Claim"("customerId");

-- CreateIndex
CREATE INDEX "FollowUp_branchId_dueAt_status_idx" ON "FollowUp"("branchId", "dueAt", "status");

-- CreateIndex
CREATE INDEX "Document_branchId_uploadedAt_idx" ON "Document"("branchId", "uploadedAt");

-- CreateIndex
CREATE INDEX "Activity_branchId_createdAt_idx" ON "Activity"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_customerId_createdAt_idx" ON "Activity"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Commission_branchId_status_earnedAt_idx" ON "Commission"("branchId", "status", "earnedAt");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedCustomerId_fkey" FOREIGN KEY ("convertedCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renewal" ADD CONSTRAINT "Renewal_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

