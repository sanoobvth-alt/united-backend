import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createStudentValidation = () => {
  const rules = [
    { field: "firstName", type: "notEmpty" },
    { field: "lastName", type: "notEmpty" },
    { field: "email", type: "email" },
    { field: "password", type: "notEmpty" },
    { field: "phone", type: "notEmpty" },
    { field: "gender", type: "gender" },
    { field: "dateOfBirth", type: "date" },
  ];

  return [...buildValidators(rules), generateFormError];
};

export const updateStudentValidation = () => {
  const rules = [
    { field: "firstName", type: "notEmpty" },
    { field: "lastName", type: "notEmpty" },
    { field: "email", type: "email" },
    { field: "phone", type: "notEmpty" },
    { field: "gender", type: "gender" },
    { field: "dateOfBirth", type: "date" },
  ];

  return [...buildValidators(rules), generateFormError];
};
