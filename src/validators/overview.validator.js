import { param, body } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createOverviewValidation = () => {
  const rules = [{ field: "title", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const updateOverviewValidation = () => {
  const rules = [{ field: "title", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const overviewIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid overview id"),
    generateFormError,
  ];
};

export const courseIdParamValidation = () => {
  return [
    param("courseId").isUUID().withMessage("Invalid course id"),
    generateFormError,
  ];
};
