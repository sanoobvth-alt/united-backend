import path from "node:path";
import { Router } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/async-handler.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import { validate } from "../middlewares/zod.middleware.js";
import { uploadDocument, getUploadPath, removeUploadedFile } from "../middlewares/upload.middleware.js";
import { resources } from "../features/resources.js";

const router = Router();
const documents = resources.documents;

router.get("/", authenticate, authorize("document:read"), validate(documents.querySchema, "query"), asyncHandler(documents.controller.list));
router.get("/:id", authenticate, authorize("document:read"), validate(documents.paramsSchema, "params"), asyncHandler(documents.controller.get));
router.delete("/:id", authenticate, authorize("document:delete"), validate(documents.paramsSchema, "params"), asyncHandler(documents.controller.remove));

router.post("/upload", authenticate, authorize("document:create"), uploadDocument, asyncHandler(async (req, res) => {
  try {
    const fileName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 150) || "document";
    const data = await documents.service.create(req.auth, {
      ...req.documentMetadata,
      type: req.documentMetadata.type,
      fileName,
      fileUrl: `/uploads/${req.file.filename}`,
    });
    res.status(201).json({ success: true, message: "Document uploaded successfully", data });
  } catch (error) {
    await removeUploadedFile(req.file.path);
    throw error;
  }
}));

router.get("/:id/content", authenticate, authorize("document:read"), validate(documents.paramsSchema, "params"), asyncHandler(async (req, res) => {
  const scope = req.auth.userType === "ADMIN"
    ? { id: req.params.id }
    : { id: req.params.id, branchId: req.auth.branchId };
  const document = await documents.model.findFirst({ where: scope });
  if (!document) throw new ApiError(404, "Document not found");
  if (!document.fileUrl.startsWith("/uploads/")) throw new ApiError(404, "Uploaded file not found");
  const filePath = getUploadPath(document.fileUrl.split("/").at(-1));
  res.download(filePath, document.fileName, (error) => {
    if (error && !res.headersSent) res.status(404).json({ success: false, message: "Uploaded file not found" });
  });
}));

export default router;
