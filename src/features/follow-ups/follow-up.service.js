import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { followupModel } from "./follow-up.model.js";
import { customerModel } from "../customers/customer.model.js";
import { leadModel } from "../leads/lead.model.js";
import { staffModel } from "../staff/staff.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const followupService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ title: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      followupModel.findMany({ where, skip, take, orderBy }),
      followupModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await followupModel.findFirst(where);
    if (!record) throw new ApiError(404, "Follow-up not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    await validateRelations(auth, input, branchId);
    return followupModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    await validateRelations(auth, input, current.branchId);
    delete input.branchId;
    return followupModel.update(id, input);
  },
  async remove(auth, id) {
    await this.get(auth, id);
    await followupModel.delete(id);
  },
};

async function validateRelations(auth, input, branchId) {
  const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
  if (input.customerId && !(await customerModel.findFirst({ id: input.customerId, ...scope }))) throw new ApiError(400, "customerId is invalid or outside this branch");
  if (input.leadId && !(await leadModel.findFirst({ id: input.leadId, ...scope }))) throw new ApiError(400, "leadId is invalid or outside this branch");
  if (input.staffId && !(await staffModel.findFirst({ id: input.staffId, ...scope }))) throw new ApiError(400, "staffId is invalid or outside this branch");
}
