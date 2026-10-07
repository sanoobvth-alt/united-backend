import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";
import { body, param } from "express-validator";

export const createSpotlightValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
    { field: "image", type: "fileRequired" },
  ];

  return [
    ...buildValidators(rules),
    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "active", "inactive"])
      .withMessage("Status must be ACTIVE or INACTIVE"),
    generateFormError,
  ];
};

export const updateSpotlightValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
  ];

  return [
    ...buildValidators(rules),
    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "active", "inactive"])
      .withMessage("Status must be ACTIVE or INACTIVE"),
    generateFormError,
  ];
};

export const spotlightIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid spotlight ID"),
    generateFormError,
  ];
};
