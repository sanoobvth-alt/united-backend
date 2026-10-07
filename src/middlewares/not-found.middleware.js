import ApiError from "../utils/ApiError.js";

const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(404, "Route not found 404"));
};

export default notFoundMiddleware;
