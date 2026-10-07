export const studentSerializer = (student) => {
  return {
    id: student.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    email: student.user.email,
    role: student.user.role,
    isActive: student.user.isActive,

    phone: student.phone,
    image: student.image,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,

    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
};
