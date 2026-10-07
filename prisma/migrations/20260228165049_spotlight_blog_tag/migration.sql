/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BlogTag` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `BlogTag` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `BlogTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `BlogTag` will be added. If there are existing duplicate values, this will fail.
  - Made the column `image` on table `About` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `blogId` to the `BlogTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `BlogTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `BlogTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_blogId_fkey";

-- AlterTable
ALTER TABLE "About" ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "BlogTag" DROP COLUMN "createdAt",
DROP COLUMN "tagId",
ADD COLUMN     "blogId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Spotlight" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "Tag";

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
