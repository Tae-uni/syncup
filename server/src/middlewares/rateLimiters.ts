import rateLimit from "express-rate-limit";

const makeRateLimit = (max: number, message: string) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: "TOO_MANY_REQUESTS", message },
    },
  });

// general abuse / DoS
export const globalRateLimit = makeRateLimit(300, "Too many requests, please try again later");

// brute-force protection
export const passcodeRateLimit = makeRateLimit(10, "Too many requests, please try again later");

// spam protection
export const createRateLimit = makeRateLimit(20, "Too many requests, please try again later");