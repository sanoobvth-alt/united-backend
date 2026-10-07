import { param, body } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createCurriculumValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    {
      field: "lessons",
      type: "isArray",
      requiredFields: ["title", "duration"],
    },
  ];

  return [...buildValidators(rules), generateFormError];
};

export const updateCurriculumValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    {
      field: "lessons",
      type: "isArray",
      requiredFields: ["title", "duration"],
    },
  ];

  return [...buildValidators(rules), generateFormError];
};

export const courseIdParamValidation = () => {
  return [
    param("courseId").isUUID().withMessage("Invalid course id"),
    generateFormError,
  ];
};

export const curriculumIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid curriculum id"),
    generateFormError,
  ];
};
