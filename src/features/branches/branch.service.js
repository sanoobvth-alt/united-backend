import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { branchModel } from "./branch.model.js";
import { prisma } from "../../config/prisma.js";
import bcrypt from "bcryptjs";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const branchService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (auth.userType === "BRANCH") { delete where.branchId; where.id = auth.branchId; }
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { code: { contains: query.search, mode: "insensitive" } }, { username: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      branchModel.findMany({ where, skip, take, orderBy }),
      branchModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    if (auth.userType === "BRANCH") where.id = auth.branchId;
    const record = await branchModel.findFirst(where);
    if (!record) throw new ApiError(404, "Branch not found");
    return record;
  },
  async create(auth, input) {
    if (auth.userType !== "ADMIN") throw new ApiError(403, "Only admins can create branches");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const { password, ...branchData } = input;
    return branchModel.create({ ...branchData, adminId: auth.id, passwordHash });
  },
  async update(auth, id, input) {
    if (auth.userType !== "ADMIN") throw new ApiError(403, "Only admins can update branches");
    await this.get(auth, id);
    const data = { ...input };
    if (data.password) { data.passwordHash = await bcrypt.hash(data.password, 12); delete data.password; }
    return branchModel.update(id, data);
  },
};
