import { Router } from "express";
import authRoutes from "../features/auth/auth.route.js";
import branchRoutes from "../features/branches/branch.route.js";
import staffRoutes from "../features/staff/staff.route.js";
import customerRoutes from "../features/customers/customer.route.js";
import policyRoutes from "../features/policies/policy.route.js";
import documentRoutes from "../features/documents/document.route.js";
import accountingRoutes, {
  accountingReportRoutes,
} from "../features/accounting/accounting.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/staff", staffRoutes);
router.use("/customers", customerRoutes);
router.use("/policies", policyRoutes);
router.use("/documents", documentRoutes);
router.use("/accounts", accountingRoutes.accounts);
router.use("/expenses", accountingRoutes.expenses);
router.use("/daily-closings", accountingRoutes.closings);
router.use("/reports", accountingReportRoutes);

export default router;
