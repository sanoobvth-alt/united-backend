import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { deleteLocalFile } from "../utils/file.utils.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";

export const getAllSpotlightsService = async (query) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt", "title"],
    defaultSortField: "createdAt",
  });

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  const [spotlights, total] = await Promise.all([
    prisma.spotlight.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prisma.spotlight.count({ where }),
  ]);

  return {
    data: spotlights,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const createSpotlightService = async (data, imageUrl, userId) => {
  return await prisma.spotlight.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "ACTIVE",
      image: imageUrl,
      createdById: userId,
      updatedById: userId,
    },
  });
};

export const getSpotlightByIdService = async (id) => {
  const spotlight = await prisma.spotlight.findUnique({
    where: { id, isDeleted: false },
  });

  if (!spotlight) {
    throw new ApiError(404, "Spotlight not found");
  }

  return spotlight;
};

export const updateSpotlightService = async (id, data, imageUrl, userId) => {
  const spotlight = await prisma.spotlight.findUnique({
    where: { id, isDeleted: false },
  });

  if (!spotlight) {
    throw new ApiError(404, "Spotlight not found");
  }

  const updatedSpotlight = await prisma.spotlight.update({
    where: { id },
    data: {
      title: data.title ?? spotlight.title,
      description: data.description ?? spotlight.description,
      status: data.status ?? spotlight.status,
      image: imageUrl ?? spotlight.image,
      updatedById: userId,
    },
  });
  if (imageUrl && spotlight.image) {
    await deleteLocalFile(spotlight.image);
  }

  return updatedSpotlight;
};

export const deleteSpotlightByIdService = async (id) => {
  const spotlight = await prisma.spotlight.findUnique({
    where: { id, isDeleted: false },
  });
  if (!spotlight) {
    throw new ApiError(404, "Spotlight not found");
  }
  const deletedSpotlight = await prisma.spotlight.update({
    where: { id },
    data: { isDeleted: true },
  });
  if (deletedSpotlight.image) {
    await deleteLocalFile(deletedSpotlight.image);
  }
  return deletedSpotlight;
};
