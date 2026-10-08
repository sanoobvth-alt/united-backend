import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const branches = resources.branches;

router.get("/", authenticate, authorize("branch:read"), validate(branches.querySchema, "query"), asyncHandler(branches.controller.list));
router.get("/:id", authenticate, authorize("branch:read"), validate(branches.paramsSchema, "params"), asyncHandler(branches.controller.get));
router.post("/", authenticate, authorize("branch:create"), validate(branches.createSchema), asyncHandler(branches.controller.create));
router.patch("/:id", authenticate, authorize("branch:update"), validate(branches.paramsSchema, "params"), validate(branches.updateSchema), asyncHandler(branches.controller.update));

export default router;
