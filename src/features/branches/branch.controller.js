import { branchService } from "./branch.service.js";
import { serializeBranch } from "./branch.serializer.js";

export const branchController = {
  async list(req, res) {
    const result = await branchService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeBranch), meta: result.meta });
  },
  async get(req, res) {
    const record = await branchService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeBranch(record) });
  },
  async create(req, res) {
    const record = await branchService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Branch created successfully", data: serializeBranch(record) });
  },
  async update(req, res) {
    const record = await branchService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Branch updated successfully", data: serializeBranch(record) });
  },
};
