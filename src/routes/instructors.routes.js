import express from "express";
import createUploader from "../middlewares/upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN, INSTRUCTOR } from "../constants/roles.js";
import {
  getAllInstructors,
  createInstructor,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  activateInstructor,
  resetInstructorPassword,
} from "../controllers/instructor.controller.js";
import {
  createInstructorValidation,
  updateInstructorValidation,
} from "../validators/instructor.validator.js";

const router = express.Router();
const uploadUser = createUploader("instructors");

router.get("/", authenticate, authorize(ADMIN), getAllInstructors);

router.get(
  "/:id",
  authenticate,
  authorize(ADMIN, INSTRUCTOR),
  getInstructorById,
);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadUser.single("image"),
  createInstructorValidation(),
  createInstructor,
);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN, INSTRUCTOR),
  uploadUser.single("image"),
  updateInstructorValidation(),
  updateInstructor,
);

router.delete("/:id", authenticate, authorize(ADMIN), deleteInstructor);

router.post(
  "/:id/activate",
  authenticate,
  authorize(ADMIN),
  activateInstructor,
);

router.post(
  "/:id/reset-password",
  authenticate,
  authorize(ADMIN),
  resetInstructorPassword,
);

export default router;
