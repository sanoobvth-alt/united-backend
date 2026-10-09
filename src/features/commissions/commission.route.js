import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { commissionController } from "./commission.controller.js";
import { commissionQuerySchema, commissionIdSchema, createCommissionSchema, updateCommissionSchema } from "./commission.schema.js";

const router = Router();

router.get("/", authenticate, authorize("commission:read"), validate(commissionQuerySchema, "query"), asyncHandler(commissionController.list));
router.get("/:id", authenticate, authorize("commission:read"), validate(commissionIdSchema, "params"), asyncHandler(commissionController.get));
router.post("/", authenticate, authorize("commission:create"), validate(createCommissionSchema), asyncHandler(commissionController.create));
router.patch("/:id", authenticate, authorize("commission:update"), validate(commissionIdSchema, "params"), validate(updateCommissionSchema), asyncHandler(commissionController.update));

export default router;
