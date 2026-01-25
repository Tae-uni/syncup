import { Request, Response, NextFunction, RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";

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
        return res.status(400).json({
          success: false,
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  };
