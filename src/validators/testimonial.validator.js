import { param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createTestimonialValidation = () => {
  const rules = [{ field: "description", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const updateTestimonialValidation = () => {
  const rules = [{ field: "description", type: "notEmpty" }];

  return [...buildValidators(rules), generateFormError];
};

export const testimonialIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid testimonial id"),
    generateFormError,
  ];
};
