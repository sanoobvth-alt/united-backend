import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const activities = resources.activities;

router.get("/", authenticate, authorize("activity:read"), validate(activities.querySchema, "query"), asyncHandler(activities.controller.list));
router.get("/:id", authenticate, authorize("activity:read"), validate(activities.paramsSchema, "params"), asyncHandler(activities.controller.get));

export default router;
