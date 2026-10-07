-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_updatedById_fkey";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
