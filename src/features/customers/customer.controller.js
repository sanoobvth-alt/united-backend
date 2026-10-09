import { customerService } from "./customer.service.js";
import { serializeCustomer } from "./customer.serializer.js";

export const customerController = {
  async list(req, res) {
    const result = await customerService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeCustomer), meta: result.meta });
  },
  async get(req, res) {
    const record = await customerService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeCustomer(record) });
  },
  async create(req, res) {
    const record = await customerService.create(req.auth, req.body);
    res.status(201).json({ success: true, message: "Customer created successfully", data: serializeCustomer(record) });
  },
  async update(req, res) {
    const record = await customerService.update(req.auth, req.params.id, req.body);
    res.json({ success: true, message: "Customer updated successfully", data: serializeCustomer(record) });
  },
  async remove(req, res) {
    await customerService.remove(req.auth, req.params.id);
    res.json({ success: true, message: "Customer deleted successfully", data: null });
  },
};
