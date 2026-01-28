import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  const details = isAppError ? err.details : undefined;

  res.status(statusCode).json({
    success: false,
    error: {
        code,
        message,
        ...(details ? { details } : {})
    },
  });
}