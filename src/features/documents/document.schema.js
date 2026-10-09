import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createDocumentSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  policyId: z.string().uuid().nullable().optional(),
  claimId: z.string().uuid().nullable().optional(),
  type: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1),
}).strict();

export const updateDocumentSchema = createDocumentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const documentIdSchema = z.object({ id: z.string().uuid() });

export const documentQuerySchema = baseListQuerySchema.extend({
  status: z.string().optional(),
  sortBy: z.enum(["uploadedAt", "createdAt"]).optional(),
}).strict();
