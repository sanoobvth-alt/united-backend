import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { insurerController } from "./insurer.controller.js";
import {
  createInsurerSchema,
  insurerIdSchema,
  insurerQuerySchema,
  updateInsurerSchema,
} from "./insurer.schema.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("insurer:read"),
  validate(insurerQuerySchema, "query"),
  asyncHandler(insurerController.list),
);
router.post(
  "/",
  authenticate,
  authorize("insurer:create"),
  validate(createInsurerSchema),
  asyncHandler(insurerController.create),
);
router.patch(
  "/:id",
  authenticate,
  authorize("insurer:update"),
  validate(insurerIdSchema, "params"),
  validate(updateInsurerSchema),
  asyncHandler(insurerController.update),
);
router.delete(
  "/:id",
  authenticate,
  authorize("insurer:delete"),
  validate(insurerIdSchema, "params"),
  asyncHandler(insurerController.deactivate),
);

export default router;
