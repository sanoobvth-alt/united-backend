import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { staffModel } from "./staff.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const staffService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { phone: { contains: query.search, mode: "insensitive" } }, { email: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      staffModel.findMany({ where, skip, take, orderBy }),
      staffModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await staffModel.findFirst(where);
    if (!record) throw new ApiError(404, "Staff not found");
    return record;
  },
  async create(auth, input) {
    const branchId = auth.userType === "ADMIN" ? input.branchId : auth.branchId;
    if (!branchId) throw new ApiError(400, "branchId is required for admin-created records");
    return staffModel.create({ ...input, branchId });
  },
  async update(auth, id, input) {
    await this.get(auth, id);
    delete input.branchId;
    return staffModel.update(id, input);
  },
  async remove(auth, id) {
    await this.get(auth, id);
    await staffModel.delete(id);
  },
};
