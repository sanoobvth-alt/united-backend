import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createStaffSchema = z.object({
  branchId: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().email().nullable().optional(),
  designation: z.string().trim().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  joiningDate: z.coerce.date().nullable().optional(),
}).strict();

export const updateStaffSchema = createStaffSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const staffIdSchema = z.object({ id: z.string().uuid() });

export const staffQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sortBy: z.enum(["name", "joiningDate", "createdAt", "updatedAt"]).optional(),
}).strict();
