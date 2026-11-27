export function serializeCustomer(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    name: record.name,
    phone: record.phone,
    status: record.status,
    staffId: record.staffId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
