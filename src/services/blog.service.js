import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { deleteLocalFile } from "../utils/file.utils.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";
import toSlug from "../utils/toSlug.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizeTagIds = (tagIds) => {
  if (!tagIds) return [];
  if (Array.isArray(tagIds)) return tagIds;

  if (typeof tagIds === "string") {
    const trimmed = tagIds.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, fallback to comma-separated
    }

    return trimmed
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
  }

  return [];
};

const validateTagIds = (tagIds) => {
  const invalidIds = tagIds.filter((id) => !UUID_REGEX.test(id));
  if (invalidIds.length > 0) {
    throw new ApiError(400, `Invalid tag IDs: ${invalidIds.join(", ")}`);
  }
};

const verifyTagsExist = async (tagIds) => {
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
  });

  if (tags.length !== tagIds.length) {
    const foundIds = new Set(tags.map((t) => t.id));
    const missingIds = tagIds.filter((id) => !foundIds.has(id));
    throw new ApiError(404, `Tags not found: ${missingIds.join(", ")}`);
  }

  return tags;
};

export const getAllBlogsService = async (query) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt", "title"],
    defaultSortField: "createdAt",
  });

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        category: true,
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    data: blogs,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const createBlogService = async (data, authorId, imagePath) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(404, "Blog category not found");
  }

  const slug = data.slug || toSlug(data.title);
  const existingBlog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (existingBlog) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(400, "Blog with this slug already exists");
  }

  // Validate and verify tagIds
  const tagIds = normalizeTagIds(data.tagIds);
  if (tagIds.length > 0) {
    validateTagIds(tagIds);
    await verifyTagsExist(tagIds);
  }

  try {
    return await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: data.content,
        image: imagePath,
        status: data.status ? data.status.toUpperCase() : undefined,
        categoryId: data.categoryId,
        createdById: authorId,
        updatedById: authorId,
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        category: true,
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  } catch (error) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Failed to create blog" + (error.message ? ": " + error.message : ""),
    );
  }
};

export const getBlogByIdService = async (id) => {
  const blog = await prisma.blog.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return blog;
};

export const updateBlogService = async (id, data, currentUserId, imagePath) => {
  let oldImage = null;

  const blog = await prisma.blog.findUnique({
    where: { id, isDeleted: false },
  });

  if (!blog) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    throw new ApiError(404, "Blog not found");
  }

  if (imagePath && blog.image) {
    oldImage = blog.image;
  }

  if (data.categoryId) {
    const category = await prisma.blogCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      if (imagePath) {
        await deleteLocalFile(imagePath);
      }
      throw new ApiError(404, "Blog category not found");
    }
  }

  const nextSlug = data.slug ?? (data.title ? toSlug(data.title) : blog.slug);

  if (nextSlug !== blog.slug) {
    const existingBlog = await prisma.blog.findUnique({
      where: { slug: nextSlug },
    });

    if (existingBlog) {
      if (imagePath) {
        await deleteLocalFile(imagePath);
      }
      throw new ApiError(400, "Blog with this slug already exists");
    }
  }

  // Validate and verify tagIds if provided
  let tagIds = null;
  if (data.tagIds !== undefined) {
    tagIds = normalizeTagIds(data.tagIds);
    if (tagIds.length > 0) {
      validateTagIds(tagIds);
      await verifyTagsExist(tagIds);
    }
  }

  try {
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title ?? blog.title,
        slug: nextSlug,
        description: data.description ?? blog.description,
        content: data.content ?? blog.content,
        image: imagePath || blog.image,
        status: data.status ? data.status.toUpperCase() : blog.status,
        categoryId: data.categoryId ?? blog.categoryId,
        updatedById: currentUserId,
        ...(tagIds !== null
          ? {
              tags: {
                set: tagIds.map((tagId) => ({ id: tagId })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (oldImage) {
      await deleteLocalFile(oldImage);
    }

    return updatedBlog;
  } catch (error) {
    if (imagePath) {
      await deleteLocalFile(imagePath);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Failed to update blog" + (error.message ? ": " + error.message : ""),
    );
  }
};

export const deleteBlogService = async (id, currentUserId) => {
  const blog = await prisma.blog.findUnique({
    where: { id, isDeleted: false },
  });

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return await prisma.blog.update({
    where: { id },
    data: {
      isDeleted: true,
      updatedById: currentUserId,
    },
  });
};

export const getAllTagsService = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return {
    data: tags,
  };
};
