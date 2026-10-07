/*
  Warnings:

  - Made the column `dateOfBirth` on table `Instructor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Instructor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateOfBirth` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Instructor" ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "dateOfBirth" SET NOT NULL;
