export function serializeActivity(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    staffId: record.staffId,
    type: record.type,
    title: record.title,
    description: record.description,
    metadata: record.metadata,
    createdAt: record.createdAt,
  };
}
