import { dashboardService } from "./dashboard.service.js";
export const dashboardController = {
  async get(req, res) {
    res.json({ success: true, data: await dashboardService.get(req.auth) });
  },
};
