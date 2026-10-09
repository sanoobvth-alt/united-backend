import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { policyController } from "./policy.controller.js";
import { policyQuerySchema, policyIdSchema, createPolicySchema, updatePolicySchema } from "./policy.schema.js";

const router = Router();

router.get("/", authenticate, authorize("policy:read"), validate(policyQuerySchema, "query"), asyncHandler(policyController.list));
router.get("/:id", authenticate, authorize("policy:read"), validate(policyIdSchema, "params"), asyncHandler(policyController.get));
router.post("/", authenticate, authorize("policy:create"), validate(createPolicySchema), asyncHandler(policyController.create));
router.patch("/:id", authenticate, authorize("policy:update"), validate(policyIdSchema, "params"), validate(updatePolicySchema), asyncHandler(policyController.update));

export default router;
