import { policyService } from "./policy.service.js";
import { serializePolicy } from "./policy.serializer.js";

export const policyController = {
  async list(req, res) {
    const result = await policyService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializePolicy), meta: result.meta });
  },
  async get(req, res) {
    const record = await policyService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializePolicy(record) });
  },
  async create(req, res) {
    const record = await policyService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Policy created successfully", data: serializePolicy(record) });
  },
  async update(req, res) {
    const record = await policyService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Policy updated successfully", data: serializePolicy(record) });
  },
};
