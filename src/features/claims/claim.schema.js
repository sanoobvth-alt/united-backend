import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createClaimSchema = z.object({
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  policyId: z.string().uuid().nullable().optional(),
  claimNumber: z.string().trim().nullable().optional(),
  claimDate: z.coerce.date(),
  status: z.enum(["REPORTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"]).optional(),
  amount: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
}).strict();

export const updateClaimSchema = createClaimSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const claimIdSchema = z.object({ id: z.string().uuid() });

export const claimQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["REPORTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"]).optional(),
  sortBy: z.enum(["claimDate", "createdAt", "updatedAt"]).optional(),
}).strict();
