import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { staffController } from "./staff.controller.js";
import { staffQuerySchema, staffIdSchema, createStaffSchema, updateStaffSchema } from "./staff.schema.js";

const router = Router();

router.get("/", authenticate, authorize("staff:read"), validate(staffQuerySchema, "query"), asyncHandler(staffController.list));
router.get("/:id", authenticate, authorize("staff:read"), validate(staffIdSchema, "params"), asyncHandler(staffController.get));
router.post("/", authenticate, authorize("staff:create"), validate(createStaffSchema), asyncHandler(staffController.create));
router.patch("/:id", authenticate, authorize("staff:update"), validate(staffIdSchema, "params"), validate(updateStaffSchema), asyncHandler(staffController.update));
router.delete("/:id", authenticate, authorize("staff:delete"), validate(staffIdSchema, "params"), asyncHandler(staffController.remove));

export default router;
