import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resources } from "../features/resources.js";

const router = Router();
const leads = resources.leads;

router.get("/", authenticate, authorize("lead:read"), validate(leads.querySchema, "query"), asyncHandler(leads.controller.list));
router.get("/:id", authenticate, authorize("lead:read"), validate(leads.paramsSchema, "params"), asyncHandler(leads.controller.get));
router.post("/", authenticate, authorize("lead:create"), validate(leads.createSchema), asyncHandler(leads.controller.create));
router.post("/:id/convert", authenticate, authorize("lead:update"), validate(leads.paramsSchema, "params"), asyncHandler(async (req, res) => {
  const data = await leads.service.convertLead(req.auth, req.params.id);
  res.status(201).json({ success: true, message: "Lead converted successfully", data });
}));
router.patch("/:id", authenticate, authorize("lead:update"), validate(leads.paramsSchema, "params"), validate(leads.updateSchema), asyncHandler(leads.controller.update));
router.delete("/:id", authenticate, authorize("lead:delete"), validate(leads.paramsSchema, "params"), asyncHandler(leads.controller.remove));

export default router;
