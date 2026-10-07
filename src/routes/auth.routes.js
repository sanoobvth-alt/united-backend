import express from "express";
import createUploader from "../middlewares/upload.middleware.js";
// controllers
import {
  login,
  signUpStudent,
  signUpInstructor,
} from "../controllers/auth.controller.js";
// validations
import { loginValidation } from "../validators/auth.validator.js";
// roles
import { createStudentValidation } from "../validators/student.validator.js";
import { createInstructorValidation } from "../validators/instructor.validator.js";

const router = express.Router();

const uploadUser = createUploader("users");

router.post("/login", loginValidation(), login);

router.post(
  "/signup-student",
  uploadUser.single("image"),
  createStudentValidation(),
  signUpStudent,
);

router.post(
  "/signup-instructor",
  uploadUser.single("image"),
  createInstructorValidation(),
  signUpInstructor,
);

export default router;
