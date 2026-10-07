/*
  Warnings:

  - Added the required column `phone` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_updatedById_fkey";

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isActive" SET DEFAULT false;
