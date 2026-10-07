// student_clear.js

import prisma from "../src/config/prisma.js";

async function clearStudents() {
  try {
    console.log("Deleting students and related users...");

    // Get all student userIds
    const students = await prisma.student.findMany({
      select: { userId: true },
    });

    const userIds = students.map((s) => s.userId);

    if (userIds.length === 0) {
      console.log("No students found.");
      return;
    }

    // Delete users (will cascade delete students if onDelete: Cascade is set)
    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    console.log(`Deleted ${userIds.length} students and their users.`);
  } catch (error) {
    console.log("Error clearing students:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearStudents();
