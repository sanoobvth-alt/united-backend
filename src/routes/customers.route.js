import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const customers = resources.customers;

router.get("/", authenticate, authorize("customer:read"), validate(customers.querySchema, "query"), asyncHandler(customers.controller.list));
router.get("/:id", authenticate, authorize("customer:read"), validate(customers.paramsSchema, "params"), asyncHandler(customers.controller.get));
router.post("/", authenticate, authorize("customer:create"), validate(customers.createSchema), asyncHandler(customers.controller.create));
router.patch("/:id", authenticate, authorize("customer:update"), validate(customers.paramsSchema, "params"), validate(customers.updateSchema), asyncHandler(customers.controller.update));
router.delete("/:id", authenticate, authorize("customer:delete"), validate(customers.paramsSchema, "params"), asyncHandler(customers.controller.remove));

export default router;
