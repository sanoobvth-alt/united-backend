import { z } from "zod";

// Shared URL query values used by list endpoints.
export const baseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
