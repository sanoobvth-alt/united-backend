import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createRenewalSchema = z.object({
  branchId: z.string().uuid().optional(),
  policyId: z.string().uuid(),
  dueDate: z.coerce.date(),
  status: z.enum(["UPCOMING", "DUE_SOON", "DUE_TODAY", "EXPIRED", "RENEWED", "NOT_RENEWED"]).optional(),
  reminderStage: z.string().trim().nullable().optional(),
  renewedAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
}).strict();

export const updateRenewalSchema = createRenewalSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const renewalIdSchema = z.object({ id: z.string().uuid() });

export const renewalQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["UPCOMING", "DUE_SOON", "DUE_TODAY", "EXPIRED", "RENEWED", "NOT_RENEWED"]).optional(),
  sortBy: z.enum(["dueDate", "createdAt", "updatedAt"]).optional(),
}).strict();
