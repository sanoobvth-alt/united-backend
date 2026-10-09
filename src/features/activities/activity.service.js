import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { activityModel } from "./activity.model.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const activityService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.search) where.OR = [{ title: { contains: query.search, mode: "insensitive" } }, { type: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      activityModel.findMany({ where, skip, take, orderBy }),
      activityModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await activityModel.findFirst(where);
    if (!record) throw new ApiError(404, "Activity not found");
    return record;
  },
};
