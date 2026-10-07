-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "isDeleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "isDeleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CourseCategory" ALTER COLUMN "isDeleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Curriculum" ALTER COLUMN "isDeleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" ALTER COLUMN "isDeleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "isDeleted" DROP NOT NULL;
