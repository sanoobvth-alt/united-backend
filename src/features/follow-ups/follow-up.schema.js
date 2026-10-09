import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createFollowupSchema = z.object({
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().nullable().optional(),
  leadId: z.string().uuid().nullable().optional(),
  staffId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1),
  dueAt: z.coerce.date(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().trim().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
}).strict();

export const updateFollowupSchema = createFollowupSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const followupIdSchema = z.object({ id: z.string().uuid() });

export const followupQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  sortBy: z.enum(["dueAt", "createdAt", "updatedAt"]).optional(),
}).strict();
