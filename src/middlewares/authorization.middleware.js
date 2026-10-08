import { PERMISSIONS } from "../constants/permissions.js";
import { ApiError } from "../utils/ApiError.js";

export const authorize = (permission) => (req, _res, next) => {
  const allowed = PERMISSIONS[permission];
  if (!allowed)
    return next(new ApiError(500, `Unknown permission: ${permission}`));
  if (!req.auth || !allowed.includes(req.auth.userType))
    return next(
      new ApiError(403, "You do not have permission to perform this action"),
    );
  next();
};
