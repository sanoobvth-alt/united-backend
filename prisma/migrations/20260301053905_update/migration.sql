/*
  Warnings:

  - Made the column `image` on table `Spotlight` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Spotlight" ALTER COLUMN "image" SET NOT NULL;
