import { param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createBlogCategoryValidation = () => {
  const rules = [{ field: "name", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const updateBlogCategoryValidation = () => {
  const rules = [{ field: "name", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const blogCategoryIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid blog category id"),
    generateFormError,
  ];
};
