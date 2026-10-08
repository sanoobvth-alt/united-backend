export const validate =
  (schema, target = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) return next(result.error);
    req[target] = result.data;
    next();
  };
