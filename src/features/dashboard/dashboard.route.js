import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("dashboard:read"),
  asyncHandler(dashboardController.get),
);

export default router;
