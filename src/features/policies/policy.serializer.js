export function serializePolicy(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    policyNumber: record.policyNumber,
    insurer: record.insurer,
    product: record.product,
    policyType: record.policyType,
    premium: record.premium,
    startDate: record.startDate,
    expiryDate: record.expiryDate,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
