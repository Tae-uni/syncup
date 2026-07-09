import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const isAppError = err instanceof AppError;

  // Log unexpected errors server-side; never expose their raw message to clients.
  if (!isAppError) {
    console.error(err);
  }

  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";
  const message = isAppError ? err.message : "Internal server error";

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