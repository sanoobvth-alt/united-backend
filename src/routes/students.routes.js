import express from "express";
import createUploader from "../middlewares/upload.middleware.js";
import {
  createStudentValidation,
  updateStudentValidation,
} from "../validators/student.validator.js";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  activateStudent,
  resetStudentPassword,
  enrollStudent,
} from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN, STUDENT } from "../constants/roles.js";

const router = express.Router();
const uploadUser = createUploader("students");

router.get("/", authenticate, authorize(ADMIN), getAllStudents);

router.get("/:id", authenticate, authorize(ADMIN, STUDENT), getStudentById);

router.post(
  "/",
  authenticate,
  authorize(ADMIN),
  uploadUser.single("image"),
  createStudentValidation(),
  createStudent,
);

router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN, STUDENT),
  uploadUser.single("image"),
  updateStudentValidation(),
  updateStudent,
);

router.delete("/:id", authenticate, authorize(ADMIN), deleteStudent);

router.post("/:id/activate", authenticate, authorize(ADMIN), activateStudent);

router.post(
  "/:id/reset-password",
  authenticate,
  authorize(ADMIN),
  resetStudentPassword,
);

router.post("/:id/enroll", authenticate, authorize(ADMIN), enrollStudent);

export default router;
