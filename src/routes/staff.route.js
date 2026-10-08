import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const staff = resources.staff;

router.get("/", authenticate, authorize("staff:read"), validate(staff.querySchema, "query"), asyncHandler(staff.controller.list));
router.get("/:id", authenticate, authorize("staff:read"), validate(staff.paramsSchema, "params"), asyncHandler(staff.controller.get));
router.post("/", authenticate, authorize("staff:create"), validate(staff.createSchema), asyncHandler(staff.controller.create));
router.patch("/:id", authenticate, authorize("staff:update"), validate(staff.paramsSchema, "params"), validate(staff.updateSchema), asyncHandler(staff.controller.update));
router.delete("/:id", authenticate, authorize("staff:delete"), validate(staff.paramsSchema, "params"), asyncHandler(staff.controller.remove));

export default router;
