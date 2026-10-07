export const instructorSerializer = (instructor) => {
  return {
    id: instructor.id,
    firstName: instructor.user.firstName,
    lastName: instructor.user.lastName,
    email: instructor.user.email,
    role: instructor.user.role,
    isActive: instructor.user.isActive,

    phone: instructor.phone,
    image: instructor.image,
    gender: instructor.gender,
    bio: instructor.bio,
    dateOfBirth: instructor.dateOfBirth,

    createdAt: instructor.createdAt,
    updatedAt: instructor.updatedAt,
  };
};
