/*
  Warnings:

  - You are about to drop the column `tags` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `dateUpdated` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Curriculum` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Curriculum` table. All the data in the column will be lost.
  - Made the column `duration` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `CourseCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "dateUpdated",
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "CourseCategory" ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "Curriculum" DROP COLUMN "createdById",
DROP COLUMN "updatedById";

-- CreateTable
CREATE TABLE "Overview" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Overview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_blogId_tagId_key" ON "BlogTag"("blogId", "tagId");

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
