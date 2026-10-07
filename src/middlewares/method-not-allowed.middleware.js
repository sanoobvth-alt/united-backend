import { match } from "path-to-regexp";

const methodNotAllowedMiddleware = (app) => {
  return (req, res, next) => {
    const method = req.method.toLowerCase();
    const requestPath = req.path;

    const stack = app._router?.stack;
    const routes = [];
    if (!stack) return next();

    stack.forEach((layer) => {
      if (layer.route) {
        routes.push(layer.route);
      } else if (layer.name === "router" && layer.handle.stack) {
        layer.handle.stack.forEach((handler) => {
          if (handler.route) {
            routes.push(handler.route);
          }
        });
      }
    });

    for (let route of routes) {
      const matcher = match(route.path, { decode: decodeURIComponent });

      if (matcher(requestPath)) {
        if (!route.methods[method]) {
          return res.status(405).json({
            error: `Method "${req.method}" not allowed`,
          });
        }
      }
    }

    next();
  };
};

export default methodNotAllowedMiddleware;
