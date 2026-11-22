export function serializePolicy(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    customerName: record.customer?.name ?? null,
    policyNumber: record.policyNumber,
    insurer:
      record.insurerType === "UNITED"
        ? "United Insurance"
        : (record.insurerRecord?.name ?? null),
    insurerType: record.insurerType,
    insurerId: record.insurerId,
    product: record.product,
    premium: record.premium,
    startDate: record.startDate,
    expiryDate: record.expiryDate,
    status: record.status,
    insuranceClass: record.insuranceClass,
    vehicleNumber: record.vehicleNumber,
    vehicleType: record.vehicleType,
    vehicleDetails: record.vehicleDetails,
    amountPartOne: record.amountPartOne,
    amountPartTwo: record.amountPartTwo,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
