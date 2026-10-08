import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const followUps = resources["follow-ups"];

router.get("/", authenticate, authorize("followup:read"), validate(followUps.querySchema, "query"), asyncHandler(followUps.controller.list));
router.get("/:id", authenticate, authorize("followup:read"), validate(followUps.paramsSchema, "params"), asyncHandler(followUps.controller.get));
router.post("/", authenticate, authorize("followup:create"), validate(followUps.createSchema), asyncHandler(followUps.controller.create));
router.patch("/:id", authenticate, authorize("followup:update"), validate(followUps.paramsSchema, "params"), validate(followUps.updateSchema), asyncHandler(followUps.controller.update));
router.delete("/:id", authenticate, authorize("followup:delete"), validate(followUps.paramsSchema, "params"), asyncHandler(followUps.controller.remove));

export default router;
