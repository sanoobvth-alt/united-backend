import { staffService } from "./staff.service.js";
import { serializeStaff } from "./staff.serializer.js";

export const staffController = {
  async list(req, res) {
    const result = await staffService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeStaff), meta: result.meta });
  },
  async get(req, res) {
    const record = await staffService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeStaff(record) });
  },
  async create(req, res) {
    const record = await staffService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Staff created successfully", data: serializeStaff(record) });
  },
  async update(req, res) {
    const record = await staffService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Staff updated successfully", data: serializeStaff(record) });
  },
  async remove(req, res) {
    await staffService.remove(req.auth, req.params.id);
    res.json({ success: true, message: "Staff deleted successfully", data: null });
  },
};
