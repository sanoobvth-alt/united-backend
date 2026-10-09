export function serializeDocument(record) {
  if (!record) return null;
  return {
    id: record.id,
    branchId: record.branchId,
    customerId: record.customerId,
    policyId: record.policyId,
    claimId: record.claimId,
    type: record.type,
    fileName: record.fileName,
    fileUrl: record.fileUrl?.startsWith("/uploads/") ? `/api/documents/${record.id}/content` : record.fileUrl,
    uploadedAt: record.uploadedAt,
  };
}
