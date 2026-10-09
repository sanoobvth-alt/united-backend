import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { ApiError } from "../../utils/ApiError.js";
import { documentModel } from "./document.model.js";
import { customerModel } from "../customers/customer.model.js";
import { policyModel } from "../policies/policy.model.js";
import { claimModel } from "../claims/claim.model.js";
import { getUploadPath, removeUploadedFile } from "../../middlewares/upload.middleware.js";

function getScope(auth) {
  if (auth.userType === "ADMIN") return {};
  return { branchId: auth.branchId };
}

export const documentService = {
  async list(auth, query) {
    const where = getScope(auth);
    if (query.search) where.OR = [{ fileName: { contains: query.search, mode: "insensitive" } }, { type: { contains: query.search, mode: "insensitive" } }];
    const { skip, take } = getPagination(query.page, query.limit);
    const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder };
    const [records, total] = await Promise.all([
      documentModel.findMany({ where, skip, take, orderBy }),
      documentModel.count(where),
    ]);
    return { records, meta: getPaginationMeta(total, query.page, query.limit) };
  },
  async get(auth, id) {
    const where = { ...getScope(auth), id };
    const record = await documentModel.findFirst(where);
    if (!record) throw new ApiError(404, "Document not found");
    return record;
  },
  async upload(auth, metadata, file) {
    const fileName = file.originalname.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 150) || "document";
    try {
      let branchId = auth.branchId;
      const scope = auth.userType === "ADMIN" ? {} : { branchId };
      const relatedRecords = [];
      if (metadata.customerId) relatedRecords.push(await customerModel.findFirst({ id: metadata.customerId, ...scope }));
      if (metadata.policyId) relatedRecords.push(await policyModel.findFirst({ id: metadata.policyId, ...scope }));
      if (metadata.claimId) relatedRecords.push(await claimModel.findFirst({ id: metadata.claimId, ...scope }));
      if (relatedRecords.some((record) => !record)) throw new ApiError(400, "Document relation is invalid or outside this branch");
      if (auth.userType === "ADMIN") {
        branchId = relatedRecords[0]?.branchId;
        if (!branchId || relatedRecords.some((record) => record.branchId !== branchId)) throw new ApiError(400, "Document relations must belong to the same branch");
      }
      return await documentModel.create({ ...metadata, branchId, fileName, fileUrl: `/uploads/${file.filename}` });
    } catch (error) {
      await removeUploadedFile(file.path);
      throw error;
    }
  },
  async remove(auth, id) {
    const record = await this.get(auth, id);
    if (record.fileUrl.startsWith("/uploads/")) await removeUploadedFile(getUploadPath(record.fileUrl.split("/").at(-1)));
    await documentModel.delete(id);
  },
};
