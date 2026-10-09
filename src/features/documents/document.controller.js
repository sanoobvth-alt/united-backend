import { documentService } from "./document.service.js";
import { serializeDocument } from "./document.serializer.js";
import { getUploadPath } from "../../middlewares/upload.middleware.js";

export const documentController = {
  async list(req, res) {
    const result = await documentService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeDocument), meta: result.meta });
  },
  async get(req, res) {
    const record = await documentService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeDocument(record) });
  },
  async content(req, res) {
    const document = await documentService.get(req.auth, req.params.id);
    if (!document.fileUrl.startsWith("/uploads/")) return res.status(404).json({ success: false, message: "Uploaded file not found" });
    res.download(getUploadPath(document.fileUrl.split("/").at(-1)), document.fileName, (error) => {
      if (error && !res.headersSent) res.status(404).json({ success: false, message: "Uploaded file not found" });
    });
  },
  async remove(req, res) {
    await documentService.remove(req.auth, req.params.id);
    res.json({ success: true, message: "Document deleted successfully", data: null });
  },
  async upload(req, res) {
    const record = await documentService.upload(req.auth, req.documentMetadata, req.file);
    res.status(201).json({ success: true, message: "Document uploaded successfully", data: serializeDocument(record) });
  },
};
