export function serializeCustomer(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    name: record.name,
    phone: record.phone,
    email: record.email,
    dob: record.dob,
    gender: record.gender,
    address: record.address,
    notes: record.notes,
    status: record.status,
    staffId: record.staffId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
