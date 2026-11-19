import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

const branchScope = (auth) =>
  auth.userType === "ADMIN" ? {} : { branchId: auth.branchId };
const pageArgs = ({ page = 1, limit = 10, sortOrder = "desc" }) => ({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: sortOrder },
});
const meta = (count, page, limit) => ({
  page,
  limit,
  total: count,
  totalPages: Math.ceil(count / limit),
});
const dateRange = (from, to, field) =>
  from || to
    ? {
        [field]: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) },
      }
    : {};

export const accountingService = {
  async listEntries(auth, query) {
    const where = { ...branchScope(auth) };
    if (auth.userType === "ADMIN" && query.branchId)
      where.branchId = query.branchId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.policyId) where.policyId = query.policyId;
    if (query.type) where.type = query.type;
    Object.assign(where, dateRange(query.from, query.to, "occurredAt"));
    const [records, count] = await Promise.all([
      prisma.accountEntry.findMany({
        where,
        ...pageArgs(query),
        include: {
          customer: { select: { name: true, phone: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.accountEntry.count({ where }),
    ]);
    return { records, meta: meta(count, query.page, query.limit) };
  },

  async customerLedger(auth, customerId, query) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, ...branchScope(auth) },
      select: { id: true, branchId: true, name: true, phone: true },
    });
    if (!customer) throw new ApiError(404, "Customer not found");
    const where = { customerId, branchId: customer.branchId };
    Object.assign(where, dateRange(query.from, query.to, "occurredAt"));
    const [records, totals] = await Promise.all([
      prisma.accountEntry.findMany({ where, orderBy: { occurredAt: "desc" } }),
      prisma.accountEntry.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      }),
    ]);
    const amounts = Object.fromEntries(
      totals.map((row) => [row.type, Number(row._sum.amount ?? 0)]),
    );
    const charges = amounts.CHARGE ?? 0;
    const credits = (amounts.PAYMENT ?? 0) + (amounts.CREDIT ?? 0);
    return {
      customer,
      balance: Number((charges - credits).toFixed(2)),
      totals: {
        charges,
        payments: amounts.PAYMENT ?? 0,
        credits: amounts.CREDIT ?? 0,
      },
      entries: records,
    };
  },

  async createEntry(auth, input) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, ...branchScope(auth) },
      select: { id: true, branchId: true },
    });
    if (!customer)
      throw new ApiError(400, "customerId is invalid or outside this branch");
    if (input.policyId) {
      const policy = await prisma.policy.findFirst({
        where: {
          id: input.policyId,
          customerId: customer.id,
          branchId: customer.branchId,
        },
        select: { id: true },
      });
      if (!policy)
        throw new ApiError(
          400,
          "policyId must belong to the selected customer and branch",
        );
    }
    if (input.type === "PAYMENT") {
      const existingPayment = await prisma.accountEntry.findFirst({
        where: { policyId: input.policyId, type: "PAYMENT" },
        select: { id: true },
      });
      if (existingPayment)
        throw new ApiError(409, "A payment has already been recorded for this policy");
    }
    try {
      return await prisma.accountEntry.create({
        data: { ...input, branchId: customer.branchId },
      });
    } catch (error) {
      if (input.type === "PAYMENT" && error.code === "P2002")
        throw new ApiError(409, "A payment has already been recorded for this policy");
      throw error;
    }
  },

  async listExpenses(auth, query) {
    const where = { ...branchScope(auth) };
    if (auth.userType === "ADMIN" && query.branchId)
      where.branchId = query.branchId;
    if (query.category) where.category = query.category;
    Object.assign(where, dateRange(query.from, query.to, "expenseDate"));
    const [records, count] = await Promise.all([
      prisma.expense.findMany({ where, ...pageArgs(query) }),
      prisma.expense.count({ where }),
    ]);
    return { records, meta: meta(count, query.page, query.limit) };
  },
  createExpense(auth, input) {
    return prisma.expense.create({
      data: { ...input, branchId: auth.branchId },
    });
  },
  async getExpense(auth, id) {
    const record = await prisma.expense.findFirst({
      where: { id, ...branchScope(auth) },
    });
    if (!record) throw new ApiError(404, "Expense not found");
    return record;
  },
  async updateExpense(auth, id, input) {
    await this.getExpense(auth, id);
    return prisma.expense.update({ where: { id }, data: input });
  },
  async deleteExpense(auth, id) {
    await this.getExpense(auth, id);
    await prisma.expense.delete({ where: { id } });
  },

  async listClosings(auth, query) {
    const where = { ...branchScope(auth) };
    if (auth.userType === "ADMIN" && query.branchId)
      where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    Object.assign(where, dateRange(query.from, query.to, "closingDate"));
    const [records, count] = await Promise.all([
      prisma.dailyClosing.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { closingDate: query.sortOrder },
        include: { branch: { select: { id: true, name: true, code: true } } },
      }),
      prisma.dailyClosing.count({ where }),
    ]);
    return { records, meta: meta(count, query.page, query.limit) };
  },
  createClosing(auth, input) {
    return prisma.dailyClosing.create({
      data: { ...input, branchId: auth.branchId },
    });
  },
  async getClosing(auth, id) {
    const record = await prisma.dailyClosing.findFirst({
      where: { id, ...branchScope(auth) },
      include: { branch: { select: { id: true, name: true, code: true } } },
    });
    if (!record) throw new ApiError(404, "Daily closing not found");
    return record;
  },
  async updateClosing(auth, id, input) {
    const current = await this.getClosing(auth, id);
    if (current.status !== "DRAFT")
      throw new ApiError(409, "Submitted closings cannot be edited");
    return prisma.dailyClosing.update({ where: { id }, data: input });
  },
  async submitClosing(auth, id) {
    const current = await this.getClosing(auth, id);
    if (current.status !== "DRAFT")
      throw new ApiError(409, "Daily closing is already submitted");
    return prisma.dailyClosing.update({
      where: { id },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
  },

  async statusReport(auth, query) {
    const where = { ...branchScope(auth) };
    if (auth.userType === "ADMIN" && query.branchId)
      where.branchId = query.branchId;
    if (query.status) where.status = query.status;
    if (query.insuranceClass) where.insuranceClass = query.insuranceClass;
    Object.assign(where, dateRange(query.from, query.to, "startDate"));
    if (query.category) where.customer = { category: query.category };
    const policies = await prisma.policy.findMany({
      where,
      orderBy: { startDate: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, category: true },
        },
      },
    });
    const accountTotals = await prisma.accountEntry.groupBy({
      by: ["customerId", "type"],
      where: { ...branchScope(auth) },
      _sum: { amount: true },
    });
    const totalsByCustomer = new Map();
    for (const row of accountTotals) {
      const current = totalsByCustomer.get(row.customerId) ?? 0;
      const amount = Number(row._sum.amount ?? 0);
      totalsByCustomer.set(
        row.customerId,
        current + (row.type === "CHARGE" ? amount : -amount),
      );
    }
    return policies.map((policy) => ({
      customerId: policy.customer.id,
      name: policy.customer.name,
      mobileNumber: policy.customer.phone,
      customerCategory: policy.customer.category,
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      insuranceClass: policy.insuranceClass,
      amount: policy.premium,
      vehicleNumber: policy.vehicleNumber,
      vehicleCategory: policy.vehicleType,
      policyStatus: policy.status,
      outstandingBalance: Number(
        (totalsByCustomer.get(policy.customerId) ?? 0).toFixed(2),
      ),
    }));
  },

  async financialReport(auth, query) {
    const scope = { ...branchScope(auth) };
    if (auth.userType === "ADMIN" && query.branchId)
      scope.branchId = query.branchId;
    const entryWhere = {
      ...scope,
      ...dateRange(query.from, query.to, "occurredAt"),
    };
    const expenseWhere = {
      ...scope,
      ...dateRange(query.from, query.to, "expenseDate"),
    };
    const policyWhere = {
      ...scope,
      ...dateRange(query.from, query.to, "startDate"),
    };
    const [entries, expenses, policies] = await Promise.all([
      prisma.accountEntry.groupBy({
        by: ["type"],
        where: entryWhere,
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true } }),
      prisma.policy.aggregate({
        where: policyWhere,
        _sum: { premium: true, amountPartOne: true, amountPartTwo: true },
      }),
    ]);
    const amounts = Object.fromEntries(
      entries.map((r) => [r.type, Number(r._sum.amount ?? 0)]),
    );
    const payments = amounts.PAYMENT ?? 0;
    const expensesAmount = Number(expenses._sum.amount ?? 0);
    return {
      charges: amounts.CHARGE ?? 0,
      customerPayments: payments,
      customerCredits: amounts.CREDIT ?? 0,
      policyPremiums: Number(policies._sum.premium ?? 0),
      policyAmountPartOne: Number(policies._sum.amountPartOne ?? 0),
      policyAmountPartTwo: Number(policies._sum.amountPartTwo ?? 0),
      operatingExpenses: expensesAmount,
      netCashFlow: Number((payments - expensesAmount).toFixed(2)),
    };
  },
};
