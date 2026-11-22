import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

export const createInsurerSchema = z
  .object({ name: z.string().trim().min(1).max(120) })
  .strict();

export const updateInsurerSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const insurerIdSchema = z.object({ id: z.string().uuid() });

export const insurerQuerySchema = baseListQuerySchema
  .extend({
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .strict();
