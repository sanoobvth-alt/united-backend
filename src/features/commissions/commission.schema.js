import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createCommissionSchema = z.object({
  branchId: z.string().uuid().optional(),
  policyId: z.string().uuid().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
  amount: z.coerce.number().nonnegative(),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  earnedAt: z.coerce.date().optional(),
  paidAt: z.coerce.date().nullable().optional(),
}).strict();

export const updateCommissionSchema = createCommissionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const commissionIdSchema = z.object({ id: z.string().uuid() });

export const commissionQuerySchema = baseListQuerySchema.extend({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  sortBy: z.enum(["earnedAt", "createdAt", "updatedAt"]).optional(),
}).strict();
