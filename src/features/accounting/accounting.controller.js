import { accountingService } from "./accounting.service.js";

const sendList = (res, result) =>
  res.json({ success: true, data: result.records, meta: result.meta });
export const accountingController = {
  async listEntries(req, res) {
    sendList(
      res,
      await accountingService.listEntries(req.auth, req.validatedQuery),
    );
  },
  async customerLedger(req, res) {
    res.json({
      success: true,
      data: await accountingService.customerLedger(
        req.auth,
        req.params.customerId,
        req.validatedQuery,
      ),
    });
  },
  async createEntry(req, res) {
    res.status(201).json({
      success: true,
      message: "Account entry recorded",
      data: await accountingService.createEntry(req.auth, req.body),
    });
  },
  async listExpenses(req, res) {
    sendList(
      res,
      await accountingService.listExpenses(req.auth, req.validatedQuery),
    );
  },
  async createExpense(req, res) {
    res.status(201).json({
      success: true,
      data: await accountingService.createExpense(req.auth, req.body),
    });
  },
  async getExpense(req, res) {
    res.json({
      success: true,
      data: await accountingService.getExpense(req.auth, req.params.id),
    });
  },
  async updateExpense(req, res) {
    res.json({
      success: true,
      data: await accountingService.updateExpense(
        req.auth,
        req.params.id,
        req.body,
      ),
    });
  },
  async deleteExpense(req, res) {
    await accountingService.deleteExpense(req.auth, req.params.id);
    res.json({ success: true, data: null });
  },
  async listClosings(req, res) {
    sendList(
      res,
      await accountingService.listClosings(req.auth, req.validatedQuery),
    );
  },
  async createClosing(req, res) {
    res.status(201).json({
      success: true,
      data: await accountingService.createClosing(req.auth, req.body),
    });
  },
  async getClosing(req, res) {
    res.json({
      success: true,
      data: await accountingService.getClosing(req.auth, req.params.id),
    });
  },
  async updateClosing(req, res) {
    res.json({
      success: true,
      data: await accountingService.updateClosing(
        req.auth,
        req.params.id,
        req.body,
      ),
    });
  },
  async submitClosing(req, res) {
    res.json({
      success: true,
      message: "Daily closing submitted",
      data: await accountingService.submitClosing(req.auth, req.params.id),
    });
  },
  async statusReport(req, res) {
    res.json({
      success: true,
      data: await accountingService.statusReport(req.auth, req.validatedQuery),
    });
  },
  async financialReport(req, res) {
    res.json({
      success: true,
      data: await accountingService.financialReport(
        req.auth,
        req.validatedQuery,
      ),
    });
  },
};
