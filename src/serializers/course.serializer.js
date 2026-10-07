import { curriculumSerializer } from "./curriculum.serializer.js";

export const courseSerializer = (course) => {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    content: course.content,
    duration: course.duration,
    image: course.image,
    status: course.status,
    category: course.category
      ? {
          id: course.category.id,
          name: course.category.name,
          slug: course.category.slug,
        }
      : null,
    instructor: course.instructor
      ? {
          id: course.instructor.id,
          userId: course.instructor.userId,
          bio: course.instructor.bio,
        }
      : null,
    curriculum: Array.isArray(course.curriculum)
      ? course.curriculum.map(curriculumSerializer)
      : [],
    overview: Array.isArray(course.overview)
      ? course.overview.map((item) => ({
          id: item.id,
          title: item.title,
        }))
      : [],
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};
