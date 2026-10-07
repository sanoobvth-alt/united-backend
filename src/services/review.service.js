import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createReviewService = async (
  courseId,
  data,
  userId,
  currentUser,
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const student = await prisma.student.findUnique({
    where: { userId, isDeleted: false },
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      courseId: courseId,
      studentId: student.id,
    },
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this course");
  }

  return await prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      courseId: courseId,
      studentId: student.id,
    },
  });
};

export const getCourseReviewsService = async (
  courseId,
  { page = 1, limit = 10 },
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Number(limit) || 10, 100);
  const skip = (safePage - 1) * safeLimit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { courseId: courseId },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.review.count({ where: { courseId: courseId } }),
  ]);

  return {
    data: reviews,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      averageRating:
        reviews.length > 0
          ? (
              reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            ).toFixed(2)
          : 0,
    },
  };
};

export const deleteReviewService = async (id, currentUser) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the review author or admin
  if (
    review.student.userId !== currentUser?.id &&
    currentUser?.role !== "ADMIN"
  ) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  return await prisma.review.delete({
    where: { id },
  });
};

export const updateReviewService = async (id, data, currentUser) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { student: true },
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if user is the review author or admin
  if (
    review.student.userId !== currentUser?.id &&
    currentUser?.role !== "ADMIN"
  ) {
    throw new ApiError(403, "You can only update your own reviews");
  }

  return await prisma.review.update({
    where: { id },
    data: {
      rating: data.rating ?? review.rating,
      comment: data.comment ?? review.comment,
    },
    include: {
      student: { include: { user: true } },
      course: true,
    },
  });
};
