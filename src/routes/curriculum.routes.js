import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import {
  getCurriculumByCourse,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from "../controllers/curriculum.controller.js";
import {
  createCurriculumValidation,
  updateCurriculumValidation,
  courseIdParamValidation,
  curriculumIdValidation,
} from "../validators/curriculum.validator.js";

const router = express.Router();

// Get curriculum by course
router.get(
  "/course/:courseId",
  courseIdParamValidation(),
  getCurriculumByCourse,
);

// Create curriculum
router.post(
  "/course/:courseId",
  authenticate,
  authorize(ADMIN),
  courseIdParamValidation(),
  createCurriculumValidation(),
  createCurriculum,
);

// Update curriculum
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  curriculumIdValidation(),
  updateCurriculumValidation(),
  updateCurriculum,
);

// Delete curriculum
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  curriculumIdValidation(),
  deleteCurriculum,
);

export default router;
