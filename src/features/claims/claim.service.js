import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { claimModel } from "./claim.model.js";
import { customerModel } from "../customers/customer.model.js";
import { policyModel } from "../policies/policy.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const claimService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ claimNumber: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      claimModel.findMany({ where, skip, take, orderBy }),
      claimModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await claimModel.findFirst(where);
    if (!record) throw new ApiError(404, "Claim not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    await validateRelations(auth, input, branchId);
    return claimModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    delete input.branchId;
    await validateRelations(auth, { customerId: input.customerId ?? current.customerId, policyId: input.policyId ?? current.policyId }, current.branchId);
    return claimModel.update(id, input);
  },
};

async function validateRelations(auth, input, branchId) {
  const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
  const customer = await customerModel.findFirst({ id: input.customerId, ...scope });
  if (!customer) throw new ApiError(400, "customerId is invalid or outside this branch");
  if (input.policyId) {
    const policy = await policyModel.findFirst({ id: input.policyId, ...scope });
    if (!policy || policy.customerId !== input.customerId) throw new ApiError(400, "policyId must belong to the selected customer and branch");
  }
}
