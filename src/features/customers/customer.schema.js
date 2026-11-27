import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createCustomerSchema = z
  .object({
    branchId: z.string().uuid().optional(),
    name: z.string().trim().min(1),
    phone: z.string().trim().min(5),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    staffId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const customerIdSchema = z.object({ id: z.string().uuid() });

export const customerQuerySchema = baseListQuerySchema
  .extend({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
  })
  .strict();
