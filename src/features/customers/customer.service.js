import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { customerModel } from "./customer.model.js";
import { staffModel } from "../staff/staff.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const customerService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { phone: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      customerModel.findMany({ where, skip, take, orderBy }),
      customerModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await customerModel.findFirst(where);
    if (!record) throw new ApiError(404, "Customer not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    await validateStaff(auth, input.staffId, branchId);
    return customerModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    const current = await this.get(auth, id);
    await validateStaff(auth, input.staffId, current.branchId);
    delete input.branchId;
    return customerModel.update(id, input);
  },
  async remove(auth, id) {
    await this.get(auth, id);
    await customerModel.delete(id);
  },
};

async function validateStaff(auth, staffId, branchId) {
  if (!staffId) return;
  const scope = auth.userType === "ADMIN" ? { branchId } : getScope(auth);
  const staff = await staffModel.findFirst({ id: staffId, ...scope });
  if (!staff) throw new ApiError(400, "staffId is invalid or outside this branch");
}
