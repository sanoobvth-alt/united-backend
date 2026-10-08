import jwt from "jsonwebtoken";

export function generateToken({ id, userType, branchId = null }) {
  return jwt.sign({ id, userType, branchId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}
