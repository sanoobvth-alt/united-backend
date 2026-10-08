import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const renewals = resources.renewals;

router.get("/", authenticate, authorize("renewal:read"), validate(renewals.querySchema, "query"), asyncHandler(renewals.controller.list));
router.get("/:id", authenticate, authorize("renewal:read"), validate(renewals.paramsSchema, "params"), asyncHandler(renewals.controller.get));
router.patch("/:id", authenticate, authorize("renewal:update"), validate(renewals.paramsSchema, "params"), validate(renewals.updateSchema), asyncHandler(renewals.controller.update));

export default router;
