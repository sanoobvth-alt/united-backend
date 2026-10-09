export function serializeLead(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    name: record.name,
    phone: record.phone,
    email: record.email,
    source: record.source,
    interest: record.interest,
    status: record.status,
    nextFollowUpAt: record.nextFollowUpAt,
    notes: record.notes,
    staffId: record.staffId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
