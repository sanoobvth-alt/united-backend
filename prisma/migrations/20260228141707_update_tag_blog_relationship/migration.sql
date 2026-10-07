/*
  Warnings:

  - You are about to drop the column `blogId` on the `BlogTag` table. All the data in the column will be lost.
  - Added the required column `blogId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlogTag" DROP CONSTRAINT "BlogTag_blogId_fkey";

-- DropForeignKey
ALTER TABLE "BlogTag" DROP CONSTRAINT "BlogTag_tagId_fkey";

-- DropIndex
DROP INDEX "BlogTag_blogId_tagId_key";

-- AlterTable
ALTER TABLE "BlogTag" DROP COLUMN "blogId";

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "blogId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
