import { leadService } from "./lead.service.js";
import { serializeLead } from "./lead.serializer.js";
import { serializeCustomer } from "../customers/customer.serializer.js";

export const leadController = {
  async list(req, res) {
    const result = await leadService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeLead), meta: result.meta });
  },
  async get(req, res) {
    const record = await leadService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeLead(record) });
  },
  async create(req, res) {
    const record = await leadService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Lead created successfully", data: serializeLead(record) });
  },
  async update(req, res) {
    const record = await leadService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Lead updated successfully", data: serializeLead(record) });
  },
  async remove(req, res) {
    await leadService.remove(req.auth, req.params.id);
    res.json({ success: true, message: "Lead deleted successfully", data: null });
  },
  async convert(req, res) {
    const result = await leadService.convert(req.auth, req.params.id);
    res.status(201).json({ success: true, message: "Lead converted successfully", data: { customer: serializeCustomer(result.customer), leadId: result.leadId } });
  },
};
