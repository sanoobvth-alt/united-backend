import { body, param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createCourseValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
    { field: "content", type: "notEmpty" },
    { field: "duration", type: "notEmpty" },
    { field: "categoryId", type: "notEmpty" },
    { field: "image", type: "fileRequired" },
    { field: "instructorId", type: "notEmpty" },
    { field: "status", type: "status" },
  ];

  return [
    ...buildValidators(rules),
    body("categoryId").bail().isUUID().withMessage("Invalid category id"),
    body("instructorId").bail().isUUID().withMessage("Invalid instructor id"),
    generateFormError,
  ];
};

export const updateCourseValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
  ];

  return [
    ...buildValidators(rules),
    body("status")
      .optional()
      .customSanitizer((value) => value?.toUpperCase())
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("Status must be ACTIVE or INACTIVE"),
    generateFormError,
  ];
};

export const courseIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid course id"),
    generateFormError,
  ];
};
