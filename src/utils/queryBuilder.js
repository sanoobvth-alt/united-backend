export const buildQueryOptions = ({
  query,
  allowedSortFields = [],
  defaultSortField = "createdAt",
  defaultOrder = "desc",
  where = {},
}) => {
  where.isDeleted = false;
  const { page = 1, limit = 10, sortBy, order } = query;

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Number(limit) || 10, 100);

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : defaultSortField;

  const safeOrder = order === "asc" ? "asc" : defaultOrder;

  return {
    where,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    orderBy: {
      [safeSortBy]: safeOrder,
    },
    meta: {
      page: safePage,
      limit: safeLimit,
    },
  };
};
