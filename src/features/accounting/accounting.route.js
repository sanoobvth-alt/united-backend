import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { accountingController as controller } from "./accounting.controller.js";
import {
  accountQuerySchema,
  accountCustomerParamsSchema,
  createAccountEntrySchema,
  expenseQuerySchema,
  createExpenseSchema,
  updateExpenseSchema,
  closingQuerySchema,
  createClosingSchema,
  updateClosingSchema,
  idParamsSchema,
  reportQuerySchema,
} from "./accounting.schema.js";

function list(router, path, permission, schema, handler) {
  router.get(
    path,
    authenticate,
    authorize(permission),
    validate(schema, "query"),
    asyncHandler(handler),
  );
}
function write(router, method, path, permission, schema, handler) {
  router[method](
    path,
    authenticate,
    authorize(permission),
    ...(schema ? [validate(schema)] : []),
    asyncHandler(handler),
  );
}

const accounts = Router();
list(
  accounts,
  "/transactions",
  "account:read",
  accountQuerySchema,
  controller.listEntries,
);
write(
  accounts,
  "post",
  "/transactions",
  "account:write",
  createAccountEntrySchema,
  controller.createEntry,
);
accounts.get(
  "/customers/:customerId",
  authenticate,
  authorize("account:read"),
  validate(accountCustomerParamsSchema, "params"),
  validate(accountQuerySchema, "query"),
  asyncHandler(controller.customerLedger),
);

const expenses = Router();
list(
  expenses,
  "/",
  "expense:read",
  expenseQuerySchema,
  controller.listExpenses,
);
write(
  expenses,
  "post",
  "/",
  "expense:write",
  createExpenseSchema,
  controller.createExpense,
);
expenses.get(
  "/:id",
  authenticate,
  authorize("expense:read"),
  validate(idParamsSchema, "params"),
  asyncHandler(controller.getExpense),
);
expenses.patch(
  "/:id",
  authenticate,
  authorize("expense:write"),
  validate(idParamsSchema, "params"),
  validate(updateExpenseSchema),
  asyncHandler(controller.updateExpense),
);
expenses.delete(
  "/:id",
  authenticate,
  authorize("expense:write"),
  validate(idParamsSchema, "params"),
  asyncHandler(controller.deleteExpense),
);

const closings = Router();
list(
  closings,
  "/",
  "closing:read",
  closingQuerySchema,
  controller.listClosings,
);
write(
  closings,
  "post",
  "/",
  "closing:write",
  createClosingSchema,
  controller.createClosing,
);
closings.get(
  "/:id",
  authenticate,
  authorize("closing:read"),
  validate(idParamsSchema, "params"),
  asyncHandler(controller.getClosing),
);
closings.patch(
  "/:id",
  authenticate,
  authorize("closing:write"),
  validate(idParamsSchema, "params"),
  validate(updateClosingSchema),
  asyncHandler(controller.updateClosing),
);
closings.post(
  "/:id/submit",
  authenticate,
  authorize("closing:write"),
  validate(idParamsSchema, "params"),
  asyncHandler(controller.submitClosing),
);

const report = Router();
list(
  report,
  "/status",
  "report:read",
  reportQuerySchema,
  controller.statusReport,
);
list(
  report,
  "/financial",
  "report:read",
  reportQuerySchema,
  controller.financialReport,
);

export default { accounts, expenses, closings };
export { report as accountingReportRoutes };
