import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { leadController } from "./lead.controller.js";
import { leadQuerySchema, leadIdSchema, createLeadSchema, updateLeadSchema } from "./lead.schema.js";

const router = Router();

router.get("/", authenticate, authorize("lead:read"), validate(leadQuerySchema, "query"), asyncHandler(leadController.list));
router.get("/:id", authenticate, authorize("lead:read"), validate(leadIdSchema, "params"), asyncHandler(leadController.get));
router.post("/", authenticate, authorize("lead:create"), validate(createLeadSchema), asyncHandler(leadController.create));
router.post("/:id/convert", authenticate, authorize("lead:update"), validate(leadIdSchema, "params"), asyncHandler(leadController.convert));
router.patch("/:id", authenticate, authorize("lead:update"), validate(leadIdSchema, "params"), validate(updateLeadSchema), asyncHandler(leadController.update));
router.delete("/:id", authenticate, authorize("lead:delete"), validate(leadIdSchema, "params"), asyncHandler(leadController.remove));

export default router;
