import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const claims = resources.claims;

router.get("/", authenticate, authorize("claim:read"), validate(claims.querySchema, "query"), asyncHandler(claims.controller.list));
router.get("/:id", authenticate, authorize("claim:read"), validate(claims.paramsSchema, "params"), asyncHandler(claims.controller.get));
router.post("/", authenticate, authorize("claim:create"), validate(claims.createSchema), asyncHandler(claims.controller.create));
router.patch("/:id", authenticate, authorize("claim:update"), validate(claims.paramsSchema, "params"), validate(claims.updateSchema), asyncHandler(claims.controller.update));

export default router;
