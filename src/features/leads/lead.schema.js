import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createLeadSchema = z.object({
  branchId: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().email().nullable().optional(),
  source: z.string().trim().nullable().optional(),
  interest: z.string().trim().nullable().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
  nextFollowUpAt: z.coerce.date().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  staffId: z.string().uuid().nullable().optional(),
}).strict();

export const updateLeadSchema = createLeadSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const leadIdSchema = z.object({ id: z.string().uuid() });

export const leadQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
  sortBy: z.enum(["name", "nextFollowUpAt", "createdAt", "updatedAt"]).optional(),
}).strict();
