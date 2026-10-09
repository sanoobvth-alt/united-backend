export function serializeBranch(record) {
  if (!record) return null;
  return {
    id: record.id,
    adminId: record.adminId,
    name: record.name,
    code: record.code,
    phone: record.phone,
    email: record.email,
    address: record.address,
    status: record.status,
    username: record.username,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
