export const userSerializer = (user) => {
  const base = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  if (user.role === "STUDENT" && user.student) {
    return {
      ...base,
      phone: user.student.phone,
      image: user.student.image,
      gender: user.student.gender,
      dateOfBirth: user.student.dateOfBirth,
      id: user.student.id,
    };
  }

  if (user.role === "INSTRUCTOR" && user.instructor) {
    return {
      ...base,
      phone: user.instructor.phone,
      image: user.instructor.image,
      gender: user.instructor.gender,
      dateOfBirth: user.instructor.dateOfBirth,
      bio: user.instructor.bio,
      id: user.instructor.id,
    };
  }

  // ADMIN or other roles
  return base;
};
