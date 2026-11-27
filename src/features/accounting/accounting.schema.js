import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

const uuid = z.string().uuid();
const amount = z.coerce.number().finite().nonnegative();
const optionalDate = z.coerce.date().optional();

export const accountQuerySchema = baseListQuerySchema
  .extend({
    branchId: uuid.optional(),
    customerId: uuid.optional(),
    policyId: uuid.optional(),
    type: z.enum(["CHARGE", "PAYMENT", "CREDIT"]).optional(),
    from: optionalDate,
    to: optionalDate,
  })
  .strict();

export const accountCustomerParamsSchema = z.object({ customerId: uuid });
export const createAccountEntrySchema = z
  .object({
    customerId: uuid,
    policyId: uuid.nullable().optional(),
    type: z.enum(["CHARGE", "PAYMENT", "CREDIT"]),
    amount: amount.refine(
      (value) => value > 0,
      "Amount must be greater than zero",
    ),
    description: z.string().trim().nullable().optional(),
    occurredAt: z.coerce.date().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === "PAYMENT" && !data.policyId) {
      ctx.addIssue({
        code: "custom",
        path: ["policyId"],
        message: "A policyId is required for a policy payment",
      });
    }
  });

export const expenseQuerySchema = baseListQuerySchema
  .extend({
    branchId: uuid.optional(),
    category: z.string().trim().optional(),
    from: optionalDate,
    to: optionalDate,
  })
  .strict();
export const createExpenseSchema = z
  .object({
    category: z.string().trim().min(1),
    amount: amount.refine(
      (value) => value > 0,
      "Amount must be greater than zero",
    ),
    description: z.string().trim().nullable().optional(),
    expenseDate: z.coerce.date().optional(),
  })
  .strict();
export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const closingQuerySchema = baseListQuerySchema
  .extend({
    from: optionalDate,
    to: optionalDate,
    status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
    branchId: uuid.optional(),
  })
  .strict();
export const createClosingSchema = z
  .object({
    closingDate: z.coerce.date(),
    openingBalance: amount.nullable().optional(),
    cashReceived: amount.optional(),
    bankReceived: amount.optional(),
    expensesPaid: amount.optional(),
    closingBalanceDeclared: amount.nullable().optional(),
    notes: z.string().trim().nullable().optional(),
  })
  .strict();
export const updateClosingSchema = createClosingSchema
  .omit({ closingDate: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );
export const idParamsSchema = z.object({ id: uuid });
export const reportQuerySchema = z
  .object({
    from: optionalDate,
    to: optionalDate,
    branchId: uuid.optional(),
    insuranceClass: z.enum(["FIRST_CLASS", "THIRD_PARTY"]).optional(),
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
  })
  .strict();
