export const validate =
  (schema, target = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) return next(result.error);
    if (target === "query") {
      // Express 5 exposes req.query through a getter, so keep parsed values separately.
      req.validatedQuery = result.data;
    } else {
      req[target] = result.data;
    }
    next();
  };
