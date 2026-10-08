import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const policies = resources.policies;

router.get("/", authenticate, authorize("policy:read"), validate(policies.querySchema, "query"), asyncHandler(policies.controller.list));
router.get("/:id", authenticate, authorize("policy:read"), validate(policies.paramsSchema, "params"), asyncHandler(policies.controller.get));
router.post("/", authenticate, authorize("policy:create"), validate(policies.createSchema), asyncHandler(policies.controller.create));
router.patch("/:id", authenticate, authorize("policy:update"), validate(policies.paramsSchema, "params"), validate(policies.updateSchema), asyncHandler(policies.controller.update));

export default router;
