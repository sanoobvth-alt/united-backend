import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createBranchSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  phone: z.string().trim().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  username: z.string().trim().min(3),
  password: z.string().min(6),
}).strict();

export const updateBranchSchema = createBranchSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const branchIdSchema = z.object({ id: z.string().uuid() });

export const branchQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt"]).optional(),
}).strict();
