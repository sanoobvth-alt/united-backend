import { insurerService } from "./insurer.service.js";
import { serializeInsurer } from "./insurer.serializer.js";

export const insurerController = {
  async list(req, res) {
    const result = await insurerService.list(req.validatedQuery ?? req.query);
    res.json({
      success: true,
      data: result.records.map(serializeInsurer),
      meta: result.meta,
    });
  },
  async create(req, res) {
    const record = await insurerService.create(req.body);
    res.status(201).json({
      success: true,
      message: "Insurer created successfully",
      data: serializeInsurer(record),
    });
  },
  async update(req, res) {
    const record = await insurerService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Insurer updated successfully",
      data: serializeInsurer(record),
    });
  },
  async deactivate(req, res) {
    const record = await insurerService.deactivate(req.params.id);
    res.json({
      success: true,
      message: "Insurer deactivated successfully",
      data: serializeInsurer(record),
    });
  },
};
