import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createActivitySchema = z.object({
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().nullable().optional(),
  staffId: z.string().uuid().nullable().optional(),
  type: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
}).strict();

export const updateActivitySchema = createActivitySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const activityIdSchema = z.object({ id: z.string().uuid() });

export const activityQuerySchema = baseListQuerySchema.extend({
  status: z.string().optional(),
  sortBy: z.enum(["createdAt"]).optional(),
}).strict();
