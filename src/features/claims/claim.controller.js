import { claimService } from "./claim.service.js";
import { serializeClaim } from "./claim.serializer.js";

export const claimController = {
  async list(req, res) {
    const result = await claimService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeClaim), meta: result.meta });
  },
  async get(req, res) {
    const record = await claimService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeClaim(record) });
  },
  async create(req, res) {
    const record = await claimService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Claim created successfully", data: serializeClaim(record) });
  },
  async update(req, res) {
    const record = await claimService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Claim updated successfully", data: serializeClaim(record) });
  },
};
