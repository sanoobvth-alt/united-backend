import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";

// Course Categories
export const getAllCourseCategoriesService = async (query) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt", "name"],
    defaultSortField: "createdAt",
  });

  const [categories, total] = await Promise.all([
    prisma.courseCategory.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prisma.courseCategory.count({ where }),
  ]);

  return {
    data: categories,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const createCourseCategoryService = async (data, userId) => {
  const existing = await prisma.courseCategory.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new ApiError(400, "Course category already exists");
  }

  return await prisma.courseCategory.create({
    data: {
      name: data.name,
      description: data.description,
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

export const updateCourseCategoryService = async (id, data, userId) => {
  const category = await prisma.courseCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Course category not found");
  }

  if (data.name && data.name !== category.name) {
    const existing = await prisma.courseCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ApiError(400, "Course category name already exists");
    }
  }

  return await prisma.courseCategory.update({
    where: { id },
    data: {
      ...data,
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

// Blog Categories
export const getAllBlogCategoriesService = async () => {
  return await prisma.blogCategory.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

export const createBlogCategoryService = async (data) => {
  const existing = await prisma.blogCategory.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new ApiError(400, "Blog category already exists");
  }

  return await prisma.blogCategory.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
};

export const getBlogCategoryByIdService = async (id) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Blog category not found");
  }

  return category;
};

export const updateBlogCategoryService = async (id, data) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Blog category not found");
  }

  if (data.name && data.name !== category.name) {
    const existing = await prisma.blogCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ApiError(400, "Blog category name already exists");
    }
  }

  return await prisma.blogCategory.update({
    where: { id },
    data,
  });
};

export const deleteBlogCategoryByIdService = async (id) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id, isDeleted: false },
  });

  if (!category) {
    throw new ApiError(404, "Blog category not found");
  }

  return await prisma.blogCategory.update({
    where: { id },
    data: { isDeleted: true },
  });
};
