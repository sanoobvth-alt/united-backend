import express from "express";
import createUploader from "../middlewares/upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN, INSTRUCTOR } from "../constants/roles.js";
import {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  deleteAllCurriculumAndOverview,
} from "../controllers/course.controller.js";
import {
  createCourseValidation,
  updateCourseValidation,
  courseIdValidation,
} from "../validators/course.validator.js";

const router = express.Router();
const uploadCourse = createUploader("courses");

// Courses
router.get("/", getAllCourses);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadCourse.single("image"),
  createCourseValidation(),
  createCourse,
);

router.get("/:id", courseIdValidation(), getCourseById);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  uploadCourse.single("image"),
  updateCourseValidation(),
  updateCourse,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  courseIdValidation(),
  deleteCourse,
);

// Dev route - Delete all curriculum and overview
router.delete(
  "/delete/AllCurriculmAndOverview",
  authenticate,
  authorize(ADMIN),
  deleteAllCurriculumAndOverview,
);

export default router;
