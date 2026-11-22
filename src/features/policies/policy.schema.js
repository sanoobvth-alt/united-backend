import { z } from "zod";
import { baseListQuerySchema } from "../../utils/query-params.js";

const policyFieldsSchema = z
  .object({
    branchId: z.string().uuid().optional(),
    customerId: z.string().uuid(),
    policyNumber: z.string().trim().min(1),
    insurerType: z.enum(["UNITED", "THIRD_PARTY"]),
    insurerId: z.string().uuid().nullable().optional(),
    product: z.string().trim().min(1),
    premium: z.coerce.number().nonnegative(),
    startDate: z.coerce.date(),
    expiryDate: z.coerce.date(),
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
    insuranceClass: z.enum(["FIRST_CLASS", "THIRD_PARTY"]),
    vehicleNumber: z.string().trim().nullable().optional(),
    vehicleType: z.string().trim().nullable().optional(),
    vehicleDetails: z.string().trim().nullable().optional(),
    amountPartOne: z.coerce.number().nonnegative().nullable().optional(),
    amountPartTwo: z.coerce.number().nonnegative().nullable().optional(),
  })
  .strict();

const validateInsurerSelection = (data, ctx) => {
  if (data.insurerType === "UNITED" && data.insurerId) {
    ctx.addIssue({
      code: "custom",
      path: ["insurerId"],
      message: "United policies must not specify insurerId",
    });
  }
  if (data.insurerType === "THIRD_PARTY" && !data.insurerId) {
    ctx.addIssue({
      code: "custom",
      path: ["insurerId"],
      message: "Select an insurer for third-party policies",
    });
  }
};

export const createPolicySchema = policyFieldsSchema.superRefine(
  validateInsurerSelection,
);

export const updatePolicySchema = policyFieldsSchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field is required",
      });
    }
    if (data.insurerType === "UNITED" && data.insurerId) {
      ctx.addIssue({
        code: "custom",
        path: ["insurerId"],
        message: "United policies must not specify insurerId",
      });
    }
    if (data.insurerType === "THIRD_PARTY" && !data.insurerId) {
      ctx.addIssue({
        code: "custom",
        path: ["insurerId"],
        message: "Select an insurer for third-party policies",
      });
    }
  });

export const policyIdSchema = z.object({ id: z.string().uuid() });

export const policyQuerySchema = baseListQuerySchema
  .extend({
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
    insuranceClass: z.enum(["FIRST_CLASS", "THIRD_PARTY"]).optional(),
    sortBy: z
      .enum(["policyNumber", "expiryDate", "createdAt", "updatedAt"])
      .optional(),
  })
  .strict();
