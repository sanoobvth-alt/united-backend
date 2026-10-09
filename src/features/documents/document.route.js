import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { documentController } from "./document.controller.js";
import { documentQuerySchema, documentIdSchema } from "./document.schema.js";
import { uploadDocument } from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("document:read"), validate(documentQuerySchema, "query"), asyncHandler(documentController.list));
router.post("/upload", authenticate, authorize("document:create"), uploadDocument, asyncHandler(documentController.upload));
router.get("/:id/content", authenticate, authorize("document:read"), validate(documentIdSchema, "params"), asyncHandler(documentController.content));
router.get("/:id", authenticate, authorize("document:read"), validate(documentIdSchema, "params"), asyncHandler(documentController.get));
router.delete("/:id", authenticate, authorize("document:delete"), validate(documentIdSchema, "params"), asyncHandler(documentController.remove));

export default router;
