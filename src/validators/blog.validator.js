import { body, param } from "express-validator";
import generateFormError from "../middlewares/validate.middleware.js";
import buildValidators from "../utils/buildValidators.js";

export const createBlogValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
    { field: "content", type: "notEmpty" },
    { field: "categoryId", type: "notEmpty" },
    { field: "image", type: "fileRequired" },
    { field: "tagIds", type: "notEmpty" },
  ];

  return [
    ...buildValidators(rules),
    body("status")
      .optional()
      .isIn([
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
        "draft",
        "published",
        "archived",
      ])
      .withMessage("Status must be DRAFT, PUBLISHED or ARCHIVED"),
    body("tagIds")
      .optional()
      .customSanitizer((tagIds) => {
        if (Array.isArray(tagIds)) return tagIds;

        if (typeof tagIds === "string") {
          const trimmed = tagIds.trim();
          if (!trimmed) return [];

          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // not JSON, fallback to comma-separated
          }

          return trimmed
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }

        return tagIds;
      })
      .isArray()
      .withMessage("tagIds must be an array")
      .custom((tagIds) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return tagIds.every(
          (id) => typeof id === "string" && uuidRegex.test(id),
        );
      })
      .withMessage("All tagIds must be valid UUIDs"),
    generateFormError,
  ];
};

export const updateBlogValidation = () => {
  const rules = [
    { field: "title", type: "notEmpty" },
    { field: "description", type: "notEmpty" },
  ];

  return [
    ...buildValidators(rules),
    body("status")
      .optional()
      .isIn([
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
        "draft",
        "published",
        "archived",
      ])
      .withMessage("Status must be DRAFT, PUBLISHED or ARCHIVED"),
    body("tagIds")
      .optional()
      .customSanitizer((tagIds) => {
        if (Array.isArray(tagIds)) return tagIds;

        if (typeof tagIds === "string") {
          const trimmed = tagIds.trim();
          if (!trimmed) return [];

          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // not JSON, fallback to comma-separated
          }

          return trimmed
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }

        return tagIds;
      })
      .isArray()
      .withMessage("tagIds must be an array")
      .custom((tagIds) => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return tagIds.every(
          (id) => typeof id === "string" && uuidRegex.test(id),
        );
      })
      .withMessage("All tagIds must be valid UUIDs"),
    generateFormError,
  ];
};

export const blogIdValidation = () => {
  return [
    param("id").isUUID().withMessage("Invalid blog id"),
    generateFormError,
  ];
};
