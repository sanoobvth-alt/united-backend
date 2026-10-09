export function serializeStaff(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    name: record.name,
    phone: record.phone,
    email: record.email,
    designation: record.designation,
    status: record.status,
    joiningDate: record.joiningDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
