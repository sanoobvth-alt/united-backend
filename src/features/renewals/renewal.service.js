import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { renewalModel } from "./renewal.model.js";
import { policyModel } from "../policies/policy.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const renewalService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      renewalModel.findMany({ where, skip, take, orderBy }),
      renewalModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await renewalModel.findFirst(where);
    if (!record) throw new ApiError(404, "Renewal not found");
    return record;
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    delete input.branchId;
    const policyId = input.policyId ?? current.policyId;
    const scope = auth.userType === "ADMIN" ? { branchId: current.branchId } : getScope(auth);
    const policy = await policyModel.findFirst({ id: policyId, ...scope });
    if (!policy) throw new ApiError(400, "policyId is invalid or outside this branch");
    return renewalModel.update(id, input);
  },
};
