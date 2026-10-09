export function serializeFollowup(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    leadId: record.leadId,
    staffId: record.staffId,
    title: record.title,
    dueAt: record.dueAt,
    status: record.status,
    notes: record.notes,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
