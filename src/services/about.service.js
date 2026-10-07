import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";

export const getAllAboutService = async (query) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt", "title"],
    defaultSortField: "createdAt",
  });

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  const [about, total] = await Promise.all([
    prisma.about.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prisma.about.count({ where }),
  ]);

  return {
    data: about,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const createAboutService = async (data, imagePath, userId) => {
  return await prisma.$transaction(async (tx) => {
    const status = data.status.toUpperCase();

    if (status === "ACTIVE") {
      await tx.about.updateMany({
        where: {
          status: "ACTIVE",
        },
        data: {
          status: "INACTIVE",
        },
      });
    }

    const about = await tx.about.create({
      data: {
        title: data.title,
        description: data.description,
        image: imagePath,
        status,
        createdById: userId,
        updatedById: userId,
      },
    });

    return about;
  });
};

export const getAboutByIdService = async (id) => {
  const about = await prisma.about.findUnique({
    where: { id, isDeleted: false },
  });

  if (!about) {
    throw new ApiError(404, "About not found");
  }

  return about;
};

export const getActiveAboutService = async () => {
  const about = await prisma.about.findFirst({
    where: {
      status: "ACTIVE",
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!about) {
    throw new ApiError(404, "Active About not found");
  }

  return about;
};

export const updateAboutService = async (id, data, imagePath, userId) => {
  return await prisma.$transaction(async (tx) => {
    const about = await tx.about.findUnique({
      where: { id },
    });

    if (!about || about.isDeleted) {
      throw new ApiError(404, "About not found");
    }

    const status = data.status?.toUpperCase();

    if (status === "ACTIVE") {
      await tx.about.updateMany({
        where: {
          status: "ACTIVE",
          NOT: { id },
        },
        data: {
          status: "INACTIVE",
        },
      });
    }

    const updated = await tx.about.update({
      where: { id },
      data: {
        title: data.title ?? about.title,
        description: data.description ?? about.description,
        image: imagePath ?? data.image ?? about.image,
        status: status ?? about.status,
        updatedById: userId,
      },
    });

    return updated;
  });
};

export const deleteAboutByIdService = async (id) => {
  const about = await prisma.about.findUnique({
    where: { id, isDeleted: false },
  });

  if (!about) {
    throw new ApiError(404, "About not found");
  }

  return await prisma.about.update({
    where: { id },
    data: { isDeleted: true },
  });
};
