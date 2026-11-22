import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { insurerModel } from "./insurer.model.js";

export const insurerService = {
  async list(query) {
    const where = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }
    const { skip, take } = getPagination(query.page, query.limit);
    const [records, total] = await Promise.all([
      insurerModel.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      insurerModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },

  async create(input) {
    const existing = await insurerModel.findFirst({
      name: { equals: input.name, mode: "insensitive" },
    });
    if (existing)
      throw new ApiError(409, "An insurer with this name already exists");
    return insurerModel.create({ name: input.name });
  },

  async update(id, input) {
    const existing = await insurerModel.findFirst({ id });
    if (!existing) throw new ApiError(404, "Insurer not found");
    if (input.name) {
      const duplicate = await insurerModel.findFirst({
        id: { not: id },
        name: { equals: input.name, mode: "insensitive" },
      });
      if (duplicate)
        throw new ApiError(409, "An insurer with this name already exists");
    }
    return insurerModel.update(id, input);
  },

  async deactivate(id) {
    const existing = await insurerModel.findFirst({ id });
    if (!existing) throw new ApiError(404, "Insurer not found");
    return insurerModel.update(id, { isActive: false });
  },
};
