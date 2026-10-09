import { reportsService } from "./reports.service.js";
export const reportsController = {
  async summary(req, res) {
    res.json({ success: true, data: await reportsService.summary(req.auth) });
  },
  async renewals(req, res) {
    res.json({ success: true, data: await reportsService.renewals(req.auth) });
  },
  async commissions(req, res) {
    res.json({
      success: true,
      data: await reportsService.commissions(req.auth),
    });
  },
};
