import { commissionService } from "./commission.service.js";
import { serializeCommission } from "./commission.serializer.js";

export const commissionController = {
  async list(req, res) {
    const result = await commissionService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeCommission), meta: result.meta });
  },
  async get(req, res) {
    const record = await commissionService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeCommission(record) });
  },
  async create(req, res) {
    const record = await commissionService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Commission created successfully", data: serializeCommission(record) });
  },
  async update(req, res) {
    const record = await commissionService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Commission updated successfully", data: serializeCommission(record) });
  },
};
