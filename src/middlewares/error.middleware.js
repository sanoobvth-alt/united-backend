import { Prisma } from "../../generated/prisma/client.ts";
import { ZodError } from "zod";

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return res
      .status(409)
      .json({
        success: false,
        message: "A record with this value already exists",
      });
  }
  const status = error.statusCode || 500;
  if (status >= 500) console.error(error);
  return res
    .status(status)
    .json({
      success: false,
      message: status >= 500 ? "Internal server error" : error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
}
