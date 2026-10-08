import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export function authenticate(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
