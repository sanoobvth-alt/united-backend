import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { customerController } from "./customer.controller.js";
import { customerQuerySchema, customerIdSchema, createCustomerSchema, updateCustomerSchema } from "./customer.schema.js";

const router = Router();

router.get("/", authenticate, authorize("customer:read"), validate(customerQuerySchema, "query"), asyncHandler(customerController.list));
router.get("/:id", authenticate, authorize("customer:read"), validate(customerIdSchema, "params"), asyncHandler(customerController.get));
router.post("/", authenticate, authorize("customer:create"), validate(createCustomerSchema), asyncHandler(customerController.create));
router.patch("/:id", authenticate, authorize("customer:update"), validate(customerIdSchema, "params"), validate(updateCustomerSchema), asyncHandler(customerController.update));
router.delete("/:id", authenticate, authorize("customer:delete"), validate(customerIdSchema, "params"), asyncHandler(customerController.remove));

export default router;
