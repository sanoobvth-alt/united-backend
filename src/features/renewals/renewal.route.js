import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { renewalController } from "./renewal.controller.js";
import { renewalQuerySchema, renewalIdSchema, updateRenewalSchema } from "./renewal.schema.js";

const router = Router();

router.get("/", authenticate, authorize("renewal:read"), validate(renewalQuerySchema, "query"), asyncHandler(renewalController.list));
router.get("/:id", authenticate, authorize("renewal:read"), validate(renewalIdSchema, "params"), asyncHandler(renewalController.get));
router.patch("/:id", authenticate, authorize("renewal:update"), validate(renewalIdSchema, "params"), validate(updateRenewalSchema), asyncHandler(renewalController.update));

export default router;
