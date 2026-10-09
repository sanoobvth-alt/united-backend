export function serializeRenewal(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    policyId: record.policyId,
    dueDate: record.dueDate,
    status: record.status,
    reminderStage: record.reminderStage,
    renewedAt: record.renewedAt,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
