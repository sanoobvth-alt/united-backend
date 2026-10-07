import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createInstructorValidation = () => {
  const rules = [
    { field: "firstName", type: "notEmpty" },
    { field: "lastName", type: "notEmpty" },
    { field: "email", type: "email" },
    { field: "password", type: "notEmpty" },
    { field: "phone", type: "notEmpty" },
    { field: "bio", type: "notEmpty" },
    { field: "dateOfBirth", type: "date" },
  ];

  return [...buildValidators(rules), generateFormError];
};

export const updateInstructorValidation = () => {
  const rules = [
    { field: "firstName", type: "notEmpty" },
    { field: "lastName", type: "notEmpty" },
    { field: "email", type: "email" },
    { field: "phone", type: "notEmpty" },
    { field: "bio", type: "notEmpty" },
    { field: "dateOfBirth", type: "date" },
  ];

  return [...buildValidators(rules), generateFormError];
};
