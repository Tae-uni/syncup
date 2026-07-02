import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { AppError } from "./AppError";

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validateRequest =
  (schemas: ZodTypeAny | Schemas): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        if ("parse" in schemas) {
          req.body = schemas.parse(req.body);
          return next();
        }

        const { body, query, params } = schemas;

        if (params) req.params = params.parse(req.params);
        if (query) req.query = query.parse(req.query);
        if (body) req.body = body.parse(req.body);

        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          const tooManyOptions = error.errors.some(
            e => e.code === 'too_big' && e.path[0] === 'timeSelector'
          );
          if (tooManyOptions) {
            return next(new AppError("Too many time options", 413, "TOO_MANY_TIME_OPTIONS"));
          }

          const details = error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          }));

          return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));
        }
        return next(error);
      }
    };
