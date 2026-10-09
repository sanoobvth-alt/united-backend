import { followupService } from "./follow-up.service.js";
import { serializeFollowup } from "./follow-up.serializer.js";

export const followupController = {
  async list(req, res) {
    const result = await followupService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeFollowup), meta: result.meta });
  },
  async get(req, res) {
    const record = await followupService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeFollowup(record) });
  },
  async create(req, res) {
    const record = await followupService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Follow-up created successfully", data: serializeFollowup(record) });
  },
  async update(req, res) {
    const record = await followupService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Follow-up updated successfully", data: serializeFollowup(record) });
  },
  async remove(req, res) {
    await followupService.remove(req.auth, req.params.id);
    res.json({ success: true, message: "Follow-up deleted successfully", data: null });
  },
};
