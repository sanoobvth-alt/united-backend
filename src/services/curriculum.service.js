import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getCurriculumByCourseService = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const curriculum = await prisma.curriculum.findMany({
    where: {
      courseId,
      isDeleted: false,
    },
    include: { lessons: true },
    orderBy: { createdAt: "asc" },
  });

  return curriculum;
};

export const createCurriculumService = async (courseId, data) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const curriculum = await prisma.curriculum.create({
    data: {
      title: data.title,
      courseId: courseId,
      ...(Array.isArray(data.lessons) && data.lessons.length > 0
        ? {
            lessons: {
              create: data.lessons.map((lesson) => ({
                title: lesson.title,
                duration: lesson.duration,
              })),
            },
          }
        : {}),
    },
    include: { lessons: true },
  });

  return curriculum;
};

export const updateCurriculumService = async (id, data) => {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id, isDeleted: false },
  });

  if (!curriculum) {
    throw new ApiError(404, "Curriculum not found");
  }

  return await prisma.curriculum.update({
    where: { id },
    data: {
      title: data.title ?? curriculum.title,
      ...(Array.isArray(data.lessons)
        ? {
            lessons: {
              deleteMany: {},
              create: data.lessons.map((lesson) => ({
                title: lesson.title,
                duration: lesson.duration,
              })),
            },
          }
        : {}),
    },
    include: { lessons: true },
  });
};

export const deleteCurriculumService = async (id) => {
  const curriculum = await prisma.curriculum.findUnique({
    where: { id, isDeleted: false },
  });

  if (!curriculum) {
    throw new ApiError(404, "Curriculum not found");
  }

  return await prisma.curriculum.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
};
