export function serializeClaim(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    policyId: record.policyId,
    claimNumber: record.claimNumber,
    claimDate: record.claimDate,
    status: record.status,
    amount: record.amount,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
