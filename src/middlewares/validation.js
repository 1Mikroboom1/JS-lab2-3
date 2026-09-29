import { ValidationError } from '../errors/index.js';
export function validate(schema, source) {
  return (req, _res, next) => {
    const result = schema(req[source] ?? {});
    if (!result.valid) return next(new ValidationError(undefined, result.details));
    req[source] = result.value;
    next();
  };
}
