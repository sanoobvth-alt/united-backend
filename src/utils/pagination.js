export function getPagination(page, limit) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function getPaginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
