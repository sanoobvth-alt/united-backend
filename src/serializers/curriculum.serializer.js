export const lessonSerializer = (lesson) => {
  return {
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
};

export const curriculumSerializer = (curriculum) => {
  return {
    id: curriculum.id,
    title: curriculum.title,
    courseId: curriculum.courseId,
    lessons: Array.isArray(curriculum.lessons)
      ? curriculum.lessons.map(lessonSerializer)
      : [],
    createdAt: curriculum.createdAt,
    updatedAt: curriculum.updatedAt,
  };
};
