import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ApiError } from "../../utils/ApiError.js";
import { devController } from "./dev.controller.js";

const router = Router();

router.get(
  "/branches",
  (req, _res, next) => {
    if (process.env.NODE_ENV === "production")
      return next(new ApiError(404, "Not found"));
    next();
  },
  authenticate,
  authorize("dev:read"),
  asyncHandler(devController.listBranches),
);

export default router;
