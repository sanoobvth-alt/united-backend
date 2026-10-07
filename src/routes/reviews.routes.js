import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN, STUDENT } from "../constants/roles.js";
import {
  createReviewValidation,
  updateReviewValidation,
  reviewIdValidation,
  courseIdValidation,
} from "../validators/review.validator.js";
import {
  createReview,
  getCourseReviews,
  deleteReview,
  updateReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post(
  "/course/:courseId",
  authenticate,
  authorize(STUDENT),
  courseIdValidation(),
  createReviewValidation(),
  createReview,
);

router.get("/course/:courseId", courseIdValidation(), getCourseReviews);

router.patch(
  "/:id",
  authenticate,
  authorize(STUDENT),
  reviewIdValidation(),
  updateReviewValidation(),
  updateReview,
);

router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN, STUDENT),
  reviewIdValidation(),
  deleteReview,
);

export default router;
