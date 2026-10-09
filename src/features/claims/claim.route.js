import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { claimController } from "./claim.controller.js";
import { claimQuerySchema, claimIdSchema, createClaimSchema, updateClaimSchema } from "./claim.schema.js";

const router = Router();

router.get("/", authenticate, authorize("claim:read"), validate(claimQuerySchema, "query"), asyncHandler(claimController.list));
router.get("/:id", authenticate, authorize("claim:read"), validate(claimIdSchema, "params"), asyncHandler(claimController.get));
router.post("/", authenticate, authorize("claim:create"), validate(createClaimSchema), asyncHandler(claimController.create));
router.patch("/:id", authenticate, authorize("claim:update"), validate(claimIdSchema, "params"), validate(updateClaimSchema), asyncHandler(claimController.update));

export default router;
