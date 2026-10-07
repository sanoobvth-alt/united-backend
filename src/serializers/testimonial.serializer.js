export const testimonialSerializer = (testimonial) => {
  return {
    id: testimonial.id,
    description: testimonial.description,
    student: testimonial.student
      ? {
          id: testimonial.student.id,
          userId: testimonial.student.userId,
          firstName: testimonial.student.user?.firstName,
          lastName: testimonial.student.user?.lastName,
          email: testimonial.student.user?.email,
          image: testimonial.student.image,
        }
      : null,
    createdAt: testimonial.createdAt,
  };
};
