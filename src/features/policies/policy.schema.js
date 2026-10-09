import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createPolicySchema = z.object({
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  policyNumber: z.string().trim().min(1),
  insurer: z.string().trim().min(1),
  product: z.string().trim().min(1),
  policyType: z.string().trim().min(1),
  premium: z.coerce.number().nonnegative(),
  startDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
}).strict();

export const updatePolicySchema = createPolicySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const policyIdSchema = z.object({ id: z.string().uuid() });

export const policyQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
  sortBy: z.enum(["policyNumber", "expiryDate", "createdAt", "updatedAt"]).optional(),
}).strict();
