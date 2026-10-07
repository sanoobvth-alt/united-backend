import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { buildQueryOptions } from "../utils/queryBuilder.js";

export const getAllTestimonialsService = async (query = {}) => {
  const { skip, take, orderBy, meta, where } = buildQueryOptions({
    query,
    allowedSortFields: ["createdAt"],
    defaultSortField: "createdAt",
  });

  delete where.isDeleted;

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      include: { student: { include: { user: true } } },
      orderBy,
      skip,
      take,
    }),
    prisma.testimonial.count({ where }),
  ]);

  return {
    data: testimonials,
    meta: {
      ...meta,
      total,
      totalPages: Math.ceil(total / meta.limit),
    },
  };
};

export const createTestimonialService = async (data, userId) => {
  const student = await prisma.student.findUnique({
    where: { userId, isDeleted: false },
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  return await prisma.testimonial.create({
    data: {
      description: data.description,
      studentId: student.id,
    },
    include: { student: { include: { user: true } } },
  });
};

export const getTestimonialByIdService = async (id) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { student: { include: { user: true } } },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  return testimonial;
};

export const updateTestimonialService = async (id, data, currentUser) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  // Check if user is the testimonial creator
  if (
    testimonial.student.userId !== currentUser?.id &&
    currentUser?.role !== "ADMIN"
  ) {
    throw new ApiError(403, "You can only update your own testimonials");
  }

  return await prisma.testimonial.update({
    where: { id },
    data: {
      description: data.description ?? testimonial.description,
    },
    include: { student: { include: { user: true } } },
  });
};

export const deleteTestimonialService = async (id, currentUser) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }

  if (
    testimonial.student.userId !== currentUser?.id &&
    currentUser?.role !== "ADMIN"
  ) {
    throw new ApiError(403, "You can only delete your own testimonials");
  }

  return await prisma.testimonial.delete({
    where: { id },
    include: { student: { include: { user: true } } },
  });
};
