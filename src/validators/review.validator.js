import { body, param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createReviewValidation = () => {
  const rules = [
    { field: "rating", type: "notEmpty" },
    { field: "comment", type: "length", min: 0, max: 1000 },
  ];

  return [
    ...buildValidators(rules),
    body("rating")
      .toInt()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    generateFormError,
  ];
};

export const updateReviewValidation = () => {
  const rules = [];

  return [
    ...buildValidators(rules),
    body("rating")
      .optional()
      .toInt()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    generateFormError,
  ];
};

export const reviewIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid review id"),
    generateFormError,
  ];
};

export const courseIdValidation = () => {
  return [
    param("courseId").isUUID().withMessage("Invalid course id"),
    generateFormError,
  ];
};
