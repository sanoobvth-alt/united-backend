import { renewalService } from "./renewal.service.js";
import { serializeRenewal } from "./renewal.serializer.js";

export const renewalController = {
  async list(req, res) {
    const result = await renewalService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeRenewal), meta: result.meta });
  },
  async get(req, res) {
    const record = await renewalService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeRenewal(record) });
  },
  async update(req, res) {
    const record = await renewalService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Renewal updated successfully", data: serializeRenewal(record) });
  },
};
