import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { deleteLocalFile } from "../utils/file.utils.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";
import toSlug from "../utils/toSlug.js";

export const createCourseService = async (data, userId, imagePath) => {
  const category = await prisma.courseCategory.findUnique({
    where: { id: data.categoryId, isDeleted: false },
  });
  const instructor = await prisma.instructor.findUnique({
    where: { id: data.instructorId, isDeleted: false },
  });

  if (!category) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(404, "Course category not found");
  }
  if (!instructor) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(404, "Instructor not found");
  }

  const slug = data.slug || toSlug(data.title);
  const existingCourse = await prisma.course.findUnique({
    where: { slug },
  });

  if (existingCourse) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(400, "Course with this slug already exists");
  }

  try {
    return prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: data.content,
        duration: data.duration,
        image: imagePath || data.image,
        ...(data.status && { status: data.status.toUpperCase() }),
        categoryId: data.categoryId,
        instructorId: data.instructorId,
        createdById: userId,
        updatedById: userId,
      },
      include: { instructor: true, category: true },
    });
  } catch (error) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(
      500,
      "Failed to create course" + (error.message ? ": " + error.message : ""),
    );
  }
};

export const getAllCoursesService = async (query = {}) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt", "title"],
    defaultSortField: "createdAt",
  });

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.instructorId) {
    where.instructorId = query.instructorId;
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: true,
        category: true,
        overview: { where: { isDeleted: false } },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    data: courses,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const getCourseByIdService = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id, isDeleted: false },
    include: {
      instructor: true,
      category: true,
      curriculum: {
        where: { isDeleted: false },
        include: { lessons: true },
        orderBy: { createdAt: "asc" },
      },
      overview: {
        where: { isDeleted: false },
      },
    },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return course;
};

export const updateCourseService = async (id, data, userId, imagePath) => {
  let oldImage = null;

  const course = await prisma.course.findUnique({
    where: { id, isDeleted: false },
  });

  if (!course) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(404, "Course not found");
  }

  if (data.instructorId) {
    const instructor = await prisma.instructor.findUnique({
      where: { id: data.instructorId, isDeleted: false },
    });

    if (!instructor) {
      if (imagePath) {
        await deleteLocalFile(imagePath);
      }
      throw new ApiError(404, "Instructor not found");
    }
  }

  if (data.categoryId) {
    const category = await prisma.courseCategory.findUnique({
      where: { id: data.categoryId, isDeleted: false },
    });

    if (!category) {
      if (imagePath) {
        await deleteLocalFile(imagePath);
      }
      throw new ApiError(404, "Course category not found");
    }
  }

  const nextSlug = data.slug ?? (data.title ? toSlug(data.title) : course.slug);

  if (nextSlug !== course.slug) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: nextSlug },
    });

    if (existingCourse) {
      if (imagePath) {
        await deleteLocalFile(imagePath);
      }
      throw new ApiError(400, "Course with this slug already exists");
    }
  }

  if (imagePath && course.image) {
    oldImage = course.image;
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: {
      title: data.title ?? course.title,
      slug: nextSlug,
      description: data.description ?? course.description,
      content: data.content ?? course.content,
      duration: data.duration ?? course.duration,
      image: imagePath || course.image,
      status: data.status ? data.status.toUpperCase() : course.status,
      categoryId: data.categoryId ?? course.categoryId,
      instructorId: data.instructorId ?? course.instructorId,
      updatedById: userId,
    },
    include: { instructor: true, category: true },
  });

  if (oldImage) {
    await deleteLocalFile(oldImage);
  }

  return updatedCourse;
};

export const deleteCourseService = async (id, userId) => {
  const course = await prisma.course.findUnique({
    where: { id, isDeleted: false },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return await prisma.course.update({
    where: { id },
    data: {
      isDeleted: true,
      updatedById: userId,
    },
    include: { instructor: true, category: true },
  });
};

export const deleteAllCurriculumAndOverviewService = async (userId) => {
  return await prisma.$transaction(async (tx) => {
    const deletedCurriculum = await tx.curriculum.deleteMany({
      where: { isDeleted: false },
    });

    const deletedOverview = await tx.overview.deleteMany({
      where: { isDeleted: false },
    });

    return {
      success: true,
      data: {
        curriculumDeleted: deletedCurriculum.count,
        overviewDeleted: deletedOverview.count,
      },
    };
  });
};
