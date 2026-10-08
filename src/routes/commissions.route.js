import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const commissions = resources.commissions;

router.get("/", authenticate, authorize("commission:read"), validate(commissions.querySchema, "query"), asyncHandler(commissions.controller.list));
router.get("/:id", authenticate, authorize("commission:read"), validate(commissions.paramsSchema, "params"), asyncHandler(commissions.controller.get));
router.post("/", authenticate, authorize("commission:create"), validate(commissions.createSchema), asyncHandler(commissions.controller.create));
router.patch("/:id", authenticate, authorize("commission:update"), validate(commissions.paramsSchema, "params"), validate(commissions.updateSchema), asyncHandler(commissions.controller.update));

export default router;
