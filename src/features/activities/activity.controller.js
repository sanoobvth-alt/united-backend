import { activityService } from "./activity.service.js";
import { serializeActivity } from "./activity.serializer.js";

export const activityController = {
  async list(req, res) {
    const result = await activityService.list(req.auth, req.validatedQuery ?? req.query);
    res.json({ success: true, data: result.records.map(serializeActivity), meta: result.meta });
  },
  async get(req, res) {
    const record = await activityService.get(req.auth, req.params.id);
    res.json({ success: true, data: serializeActivity(record) });
  },
};
