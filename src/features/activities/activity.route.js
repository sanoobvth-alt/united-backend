import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { activityController } from "./activity.controller.js";
import { activityQuerySchema, activityIdSchema } from "./activity.schema.js";

const router = Router();

router.get("/", authenticate, authorize("activity:read"), validate(activityQuerySchema, "query"), asyncHandler(activityController.list));
router.get("/:id", authenticate, authorize("activity:read"), validate(activityIdSchema, "params"), asyncHandler(activityController.get));

export default router;
