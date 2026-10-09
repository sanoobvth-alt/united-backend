import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { policyModel } from "./policy.model.js";
import { customerModel } from "../customers/customer.model.js";
import { prisma } from "../../config/prisma.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const policyService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ policyNumber: { contains: query.search, mode: "insensitive" } }, { insurer: { contains: query.search, mode: "insensitive" } }, { product: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      policyModel.findMany({ where, skip, take, orderBy }),
      policyModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await policyModel.findFirst(where);
    if (!record) throw new ApiError(404, "Policy not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
    const customer = await customerModel.findFirst({ id: input.customerId, ...scope });
    if (!customer) throw new ApiError(400, "customerId is invalid or outside this branch");
    return prisma.$transaction(async (tx) => {
      const policy = await policyModel.create({ ...input, branchId }, tx);
      await tx.renewal.create({ data: { branchId, policyId: policy.id, dueDate: policy.expiryDate } });
      await tx.activity.create({ data: { branchId, customerId: policy.customerId, type: "POLICY_CREATED", title: "Policy added", description: `Policy ${policy.policyNumber} was added` } });
      return policy;
    });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    delete input.branchId;
    if (input.customerId) {
      const scope = auth.userType === "ADMIN" ? { branchId: current.branchId } : getScope(auth);
      const customer = await customerModel.findFirst({ id: input.customerId, ...scope });
      if (!customer) throw new ApiError(400, "customerId is invalid or outside this branch");
    }
    return policyModel.update(id, input);
  },
};
