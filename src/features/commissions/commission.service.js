import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { commissionModel } from "./commission.model.js";
import { policyModel } from "../policies/policy.model.js";
import { customerModel } from "../customers/customer.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const commissionService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      commissionModel.findMany({ where, skip, take, orderBy }),
      commissionModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await commissionModel.findFirst(where);
    if (!record) throw new ApiError(404, "Commission not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    await validateRelations(auth, input, branchId);
    return commissionModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    delete input.branchId;
    await validateRelations(auth, { customerId: input.customerId ?? current.customerId, policyId: input.policyId ?? current.policyId }, current.branchId);
    return commissionModel.update(id, input);
  },
};

async function validateRelations(auth, input, branchId) {
  const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
  let customer;
  if (input.customerId) {
    customer = await customerModel.findFirst({ id: input.customerId, ...scope });
    if (!customer) throw new ApiError(400, "customerId is invalid or outside this branch");
  }
  if (input.policyId) {
    const policy = await policyModel.findFirst({ id: input.policyId, ...scope });
    if (!policy || (input.customerId && policy.customerId !== input.customerId)) throw new ApiError(400, "policyId is invalid or does not belong to the selected customer");
  }
}
