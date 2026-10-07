import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import {
  getAllCourseCategories,
  createCourseCategory,
  getCourseCategoryById,
  updateCourseCategory,
  deleteCourseCategoryById,
} from "../controllers/course-category.controller.js";
import {
  createCourseCategoryValidation,
  updateCourseCategoryValidation,
  courseCategoryIdValidation,
} from "../validators/course-category.validator.js";
import createUploader from "../middlewares/upload.middleware.js";

const router = express.Router();
const uploadImage = createUploader("course-categories");

router.get("/", getAllCourseCategories);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadImage.single("image"),
  createCourseCategoryValidation(),
  createCourseCategory,
);

router.get("/:id", courseCategoryIdValidation(), getCourseCategoryById);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  courseCategoryIdValidation(),
  uploadImage.single("image"),
  updateCourseCategoryValidation(),
  updateCourseCategory,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  courseCategoryIdValidation(),
  deleteCourseCategoryById,
);

export default router;
