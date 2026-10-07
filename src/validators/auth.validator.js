import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const loginValidation = () => {
  const rules = [
    { field: "email", type: "email" },
    { field: "password", type: "notEmpty" },
  ];

  return [...buildValidators(rules), generateFormError];
};
