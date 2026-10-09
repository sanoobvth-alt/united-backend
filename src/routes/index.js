import { Router } from "express";
import authRoutes from "../features/auth/auth.route.js";
import dashboardRoutes from "../features/dashboard/dashboard.route.js";
import reportsRoutes from "../features/reports/reports.route.js";
import branchRoutes from "../features/branches/branch.route.js";
import staffRoutes from "../features/staff/staff.route.js";
import customerRoutes from "../features/customers/customer.route.js";
import leadRoutes from "../features/leads/lead.route.js";
import policyRoutes from "../features/policies/policy.route.js";
import renewalRoutes from "../features/renewals/renewal.route.js";
import claimRoutes from "../features/claims/claim.route.js";
import followUpRoutes from "../features/follow-ups/follow-up.route.js";
import documentRoutes from "../features/documents/document.route.js";
import activityRoutes from "../features/activities/activity.route.js";
import commissionRoutes from "../features/commissions/commission.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportsRoutes);
router.use("/branches", branchRoutes);
router.use("/staff", staffRoutes);
router.use("/customers", customerRoutes);
router.use("/leads", leadRoutes);
router.use("/policies", policyRoutes);
router.use("/renewals", renewalRoutes);
router.use("/claims", claimRoutes);
router.use("/follow-ups", followUpRoutes);
router.use("/documents", documentRoutes);
router.use("/activities", activityRoutes);
router.use("/commissions", commissionRoutes);

export default router;
