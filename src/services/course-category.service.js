import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";
import toSlug from "../utils/toSlug.js";

export const getAllCourseCategoriesService = async () => {
  const categories = await prisma.courseCategory.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    data: categories,
  };
};

export const createCourseCategoryService = async (data, imagePath, userId) => {
  const slug = data.slug || toSlug(data.name);

  const existing = await prisma.courseCategory.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new ApiError(400, "Course category slug already exists");
  }

  return await prisma.courseCategory.create({
    data: {
      name: data.name,
      slug,
      image: imagePath,
      createdById: userId,
      updatedById: userId,
    },
  });
};

export const getCourseCategoryByIdService = async (id) => {
  const category = await prisma.courseCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Course category not found");
  }

  return category;
};

export const updateCourseCategoryService = async (
  id,
  data,
  imagePath,
  userId,
) => {
  const category = await prisma.courseCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Course category not found");
  }

  const nextSlug = data.slug || (data.name ? toSlug(data.name) : category.slug);

  if (nextSlug !== category.slug) {
    const existing = await prisma.courseCategory.findUnique({
      where: { slug: nextSlug },
    });

    if (existing) {
      throw new ApiError(400, "Course category slug already exists");
    }
  }

  return await prisma.courseCategory.update({
    where: { id },
    data: {
      name: data.name ?? category.name,
      slug: nextSlug,
      image: imagePath ?? category.image,
      updatedById: userId,
    },
  });
};

export const deleteCourseCategoryByIdService = async (id) => {
  const category = await prisma.courseCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Course category not found");
  }

  return await prisma.courseCategory.update({
    where: { id },
    data: { isDeleted: true },
  });
};
