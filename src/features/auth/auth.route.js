import { Router } from "express";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { loginSchema } from "./auth.schema.js";
import { authController } from "./auth.controller.js";
const router = Router();
router.post(
  "/admin/login",
  validate(loginSchema),
  asyncHandler(authController.adminLogin),
);
router.post(
  "/branch/login",
  validate(loginSchema),
  asyncHandler(authController.branchLogin),
);
export default router;
