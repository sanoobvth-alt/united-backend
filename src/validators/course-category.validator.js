import { param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createCourseCategoryValidation = () => {
  const rules = [
    { field: "name", type: "notEmpty" },
    { field: "image", type: "fileRequired" },
  ];

  return [...buildValidators(rules), generateFormError];
};

export const updateCourseCategoryValidation = () => {
  const rules = [{ field: "name", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const courseCategoryIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid course category id"),
    generateFormError,
  ];
};
