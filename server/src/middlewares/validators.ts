import { Request, Response, NextFunction, RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "./AppError";

type Schemas = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

export const validateRequest =
  (schemas: AnyZodObject | Schemas): RequestHandler =>
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
          const details = error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message
          }));

          return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));
        }
        return next(error);
      }
    };
