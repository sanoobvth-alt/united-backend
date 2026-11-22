export function serializeInsurer(record) {
  if (!record) return null;
  return {
    id: record.id,
    name: record.name,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
