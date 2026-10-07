import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getOverviewByCourseService = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const overviews = await prisma.overview.findMany({
    where: {
      courseId,
      isDeleted: false,
    },
  });

  return overviews;
};

export const createOverviewService = async (courseId, data) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const overview = await prisma.overview.create({
    data: {
      title: data.title,
      courseId,
    },
  });

  return overview;
};

export const updateOverviewService = async (id, data) => {
  const overview = await prisma.overview.findUnique({
    where: { id, isDeleted: false },
  });

  if (!overview) {
    throw new ApiError(404, "Overview not found");
  }

  return await prisma.overview.update({
    where: { id },
    data: {
      title: data.title ?? overview.title,
    },
  });
};

export const deleteOverviewService = async (id) => {
  const overview = await prisma.overview.findUnique({
    where: { id, isDeleted: false },
  });

  if (!overview) {
    throw new ApiError(404, "Overview not found");
  }

  return await prisma.overview.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
};
