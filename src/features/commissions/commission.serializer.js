export function serializeCommission(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    policyId: record.policyId,
    customerId: record.customerId,
    amount: record.amount,
    status: record.status,
    earnedAt: record.earnedAt,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
