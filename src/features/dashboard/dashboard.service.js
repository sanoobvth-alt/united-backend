import { prisma } from "../../config/prisma.js";
export const dashboardService = {
  async get(auth) {
    const scope = auth.userType === "ADMIN" ? {} : { branchId: auth.branchId };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = new Date(today);
    week.setDate(week.getDate() + 7);
    const month = new Date(today);
    month.setMonth(month.getMonth() + 1);
    const [
      branches,
      staff,
      customers,
      leads,
      policies,
      claims,
      openFollowUps,
      commissions,
      renewalsDueToday,
      renewalsThisWeek,
      renewalsThisMonth,
    ] = await Promise.all([
      prisma.branch.count(
        auth.userType === "ADMIN" ? {} : { where: { id: auth.branchId } },
      ),
      prisma.staff.count({ where: scope }),
      prisma.customer.count({ where: scope }),
      prisma.lead.count({
        where: { ...scope, status: { notIn: ["CONVERTED", "LOST"] } },
      }),
      prisma.policy.count({ where: scope }),
      prisma.claim.count({ where: scope }),
      prisma.followUp.count({ where: { ...scope, status: "PENDING" } }),
      prisma.commission.aggregate({ where: scope, _sum: { amount: true } }),
      prisma.renewal.count({
        where: {
          ...scope,
          dueDate: { gte: today, lt: new Date(today.getTime() + 86400000) },
          status: { notIn: ["RENEWED", "NOT_RENEWED"] },
        },
      }),
      prisma.renewal.count({
        where: {
          ...scope,
          dueDate: { gte: today, lt: week },
          status: { notIn: ["RENEWED", "NOT_RENEWED"] },
        },
      }),
      prisma.renewal.count({
        where: {
          ...scope,
          dueDate: { gte: today, lt: month },
          status: { notIn: ["RENEWED", "NOT_RENEWED"] },
        },
      }),
    ]);
    return {
      branches,
      staff,
      customers,
      openLeads: leads,
      policies,
      claims,
      openFollowUps,
      commissionsPendingAmount: commissions._sum.amount,
      renewals: {
        dueToday: renewalsDueToday,
        thisWeek: renewalsThisWeek,
        thisMonth: renewalsThisMonth,
      },
    };
  },
};
