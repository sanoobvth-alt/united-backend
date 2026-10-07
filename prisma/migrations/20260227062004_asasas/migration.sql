/*
  Warnings:

  - Made the column `isDeleted` on table `Blog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `CourseCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `Curriculum` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `Instructor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDeleted` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "isDeleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "isDeleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "CourseCategory" ALTER COLUMN "isDeleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "Curriculum" ALTER COLUMN "isDeleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" ALTER COLUMN "isDeleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "isDeleted" SET NOT NULL;
