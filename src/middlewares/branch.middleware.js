import { ApiError } from "../utils/ApiError.js";

export function requireBranch(req, _res, next) {
  if (req.auth?.userType === "BRANCH" && !req.auth.branchId)
    return next(new ApiError(403, "Branch identity is missing"));
  next();
}
