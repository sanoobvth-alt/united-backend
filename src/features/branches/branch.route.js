import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { branchController } from "./branch.controller.js";
import { branchQuerySchema, branchIdSchema, createBranchSchema, updateBranchSchema } from "./branch.schema.js";

const router = Router();

router.get("/", authenticate, authorize("branch:read"), validate(branchQuerySchema, "query"), asyncHandler(branchController.list));
router.get("/:id", authenticate, authorize("branch:read"), validate(branchIdSchema, "params"), asyncHandler(branchController.get));
router.post("/", authenticate, authorize("branch:create"), validate(createBranchSchema), asyncHandler(branchController.create));
router.patch("/:id", authenticate, authorize("branch:update"), validate(branchIdSchema, "params"), validate(updateBranchSchema), asyncHandler(branchController.update));

export default router;
