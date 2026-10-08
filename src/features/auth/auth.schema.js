import { z } from "zod";
export const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    username: z.string().trim().min(1).optional(),
    password: z.string().min(1),
  })
  .refine(
    (data) => data.email || data.username,
    "Email or username is required",
  );
