import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

import ApiError from "../utils/ApiError.js";
import toUTCDate from "../utils/toUTC.js";
import { ADMIN, INSTRUCTOR, STUDENT } from "../constants/roles.js";
import { deleteLocalFile } from "../utils/file.utils.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";

export const createInstructorWithUser = async (data, user, imagePath) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) throw new ApiError(400, "Email already exists");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  let { role, id: userId } = user || {};

  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: INSTRUCTOR,
        isActive: role === ADMIN ? true : false,
      },
    });

    const creatorId = userId || newUser.id;

    const instructor = await tx.instructor.create({
      data: {
        userId: newUser.id,
        phone: data.phone,
        image: imagePath,
        bio: data.bio,
        gender: data.gender.toUpperCase(),
        dateOfBirth: toUTCDate(data.dateOfBirth),
        createdById: creatorId,
        updatedById: creatorId,
      },
    });

    return { ...newUser, instructor };
  });

  return result;
};

export async function updateInstructorService(
  id,
  data,
  currentUserId,
  imagePath,
) {
  let oldImage = null;

  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ Update User (without role)
    const userUpdateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    };

    const instructor = await tx.instructor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!instructor) {
      throw new ApiError(404, "Instructor not found");
    }

    // Email uniqueness check
    if (data.email && data.email !== instructor.user.email) {
      const existing = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ApiError(400, "Email already registered");
      }
    }

    await tx.user.update({
      where: { id: instructor.userId },
      data: userUpdateData,
    });

    // Save old image before overwriting
    if (imagePath && instructor.image) {
      oldImage = instructor.image;
    }

    // 2️⃣ Update Instructor profile
    const updatedInstructor = await tx.instructor.update({
      where: { id },
      data: {
        phone: data.phone,
        image: imagePath || instructor.image,
        bio: data.bio,
        gender: data.gender?.toUpperCase(),
        dateOfBirth: toUTCDate(data.dateOfBirth),
        updatedById: currentUserId,
      },
      include: {
        user: true,
      },
    });

    return updatedInstructor;
  });
  if (oldImage) {
    await deleteLocalFile(oldImage);
  }
  return result;
}

export const getAllInstructorsService = async (query) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({ query });

  if (query.isActive !== undefined) {
    where.user = {
      isActive: query.isActive === "true",
    };
  }
  if (query.isDeleted !== undefined) {
    where.isDeleted = query.isDeleted === "true";
  }
  const [instructors, total] = await Promise.all([
    prisma.instructor.findMany({
      where,
      include: { user: true },
      orderBy,
      skip,
      take,
    }),
    prisma.instructor.count({ where }),
  ]);

  return {
    data: instructors,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const getInstructorByIdService = async (id) => {
  const instructor = await prisma.instructor.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  return instructor;
};

export const deleteInstructorService = async (id, currentUserId) => {
  const instructor = await prisma.instructor.findUnique({
    where: { id, isDeleted: false },
    include: { user: true },
  });

  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }
  await prisma.user.update({
    where: { id: instructor.userId },
    data: {
      isActive: false,
    },
  });
  await prisma.instructor.update({
    where: { id },
    data: {
      isDeleted: true,
      updatedById: currentUserId,
    },
    include: { user: true },
  });
};

export const activateInstructorService = async (id, currentUserId) => {
  const instructor = await prisma.instructor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }
  await prisma.user.update({
    where: { id: instructor.userId },
    data: { isActive: true },
  });

  prisma.instructor.update({
    where: { id },
    include: { user: true },
    data: { updatedById: currentUserId },
  });
};

export const resetInstructorPasswordService = async (
  id,
  newPassword,
  currentUserId,
) => {
  if (!newPassword) {
    throw new ApiError(400, "Password is required");
  }
  const instructor = await prisma.instructor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: instructor.userId },
    data: { password: hashedPassword },
  });

  await prisma.instructor.update({
    where: { id },
    include: { user: true },
    data: { updatedById: currentUserId },
  });
};
