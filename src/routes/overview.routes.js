import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN } from "../constants/roles.js";
import {
  getOverviewByCourse,
  createOverview,
  updateOverview,
  deleteOverview,
} from "../controllers/overview.controller.js";
import {
  createOverviewValidation,
  updateOverviewValidation,
  courseIdParamValidation,
  overviewIdValidation,
} from "../validators/overview.validator.js";

const router = express.Router();

// Get overview by course
router.get("/course/:courseId", courseIdParamValidation(), getOverviewByCourse);

// Create overview
router.post(
  "/course/:courseId",
  authenticate,
  authorize(ADMIN),
  courseIdParamValidation(),
  createOverviewValidation(),
  createOverview,
);

// Update overview
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN),
  overviewIdValidation(),
  updateOverviewValidation(),
  updateOverview,
);

// Delete overview
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN),
  overviewIdValidation(),
  deleteOverview,
);

export default router;
