import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { followupController } from "./follow-up.controller.js";
import { followupQuerySchema, followupIdSchema, createFollowupSchema, updateFollowupSchema } from "./follow-up.schema.js";

const router = Router();

router.get("/", authenticate, authorize("followup:read"), validate(followupQuerySchema, "query"), asyncHandler(followupController.list));
router.get("/:id", authenticate, authorize("followup:read"), validate(followupIdSchema, "params"), asyncHandler(followupController.get));
router.post("/", authenticate, authorize("followup:create"), validate(createFollowupSchema), asyncHandler(followupController.create));
router.patch("/:id", authenticate, authorize("followup:update"), validate(followupIdSchema, "params"), validate(updateFollowupSchema), asyncHandler(followupController.update));
router.delete("/:id", authenticate, authorize("followup:delete"), validate(followupIdSchema, "params"), asyncHandler(followupController.remove));

export default router;
