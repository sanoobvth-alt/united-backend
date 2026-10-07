/*
  Warnings:

  - You are about to drop the column `profileImage` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "profileImage",
ADD COLUMN     "image" TEXT;
