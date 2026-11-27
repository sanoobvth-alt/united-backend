/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `convertedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `convertedCustomerId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Commission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowUp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_policyId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_claimId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_policyId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_branchId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_customerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_leadId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_convertedCustomerId_fkey";

-- DropIndex
DROP INDEX "Lead_convertedCustomerId_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "address",
DROP COLUMN "dob",
DROP COLUMN "email",
DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "convertedAt",
DROP COLUMN "convertedCustomerId";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Commission";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "FollowUp";

-- DropEnum
DROP TYPE "CommissionStatus";

-- DropEnum
DROP TYPE "FollowUpStatus";
