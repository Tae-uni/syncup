import { z } from "zod";

const MAX_TIME_OPTIONS = 20;

const isValidTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (error) {
    console.error(`Invalid time zone: ${tz}`, error);
    return false;
  }
}

export const timeSelectorSchema = z.object({
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date",
  }),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, "Invalid start time"),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, "Invalid end time"),
}).superRefine((val, ctx) => {
  const start = Date.parse(val.startTime);
  const end = Date.parse(val.endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return;

  if (start >= end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
    });
  }
});

export const syncInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(300, "Description is too long").optional(),
  timeZone: z.string().refine(isValidTimeZone, {
    message: "Invalid time zone",
  }).default("UTC"),
  expiresAt: z.string().datetime()
    .refine((val) => Date.parse(val) > Date.now(), "Expiry must be in the future")
    .refine((val) => Date.parse(val) <= Date.now() + 30 * 24 * 60 * 60 * 1000, "Expiry must be within 30 days")
    .optional()
    .default(() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString();
    }),
  timeSelector: z.array(timeSelectorSchema)
    .min(1, "At least one time selector is required")
    .max(MAX_TIME_OPTIONS, `At most ${MAX_TIME_OPTIONS} time options are allowed`),
  leaderPasscode: z.string().length(4, "Passcode must be 4 digits").regex(/^\d{4}$/, "Passcode must be 4 digits"),
}).superRefine((val, ctx) => {
  const seen = new Set<string>();
  for (const t of val.timeSelector) {
    const key = `${t.startTime}|${t.endTime}`;
    if (seen.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate time slots are not allowed",
        path: ["timeSelector"],
      });
      return;
    }
    seen.add(key);
  }
});

export const syncUpdateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(300, "Description is too long").optional(),
  timeZone: z.string().refine(isValidTimeZone, {
    message: "Invalid time zone",
  }),
  timeSelector: z.array(timeSelectorSchema)
    .min(1, "At least one time selector is required")
    .max(MAX_TIME_OPTIONS, `At most ${MAX_TIME_OPTIONS} time options are allowed`),
  leaderPasscode: z.string().length(4, "Passcode must be 4 digits").regex(/^\d{4}$/, "Passcode must be 4 digits"),
})

export const verifyLeaderSchema = z.object({
  leaderPasscode: z.string().length(4, "Passcode must be 4 digits").regex(/^\d{4}$/, "Passcode must be 4 digits"),
});

export const voteSchema = {
  // Submit vote
  submit: z.object({
    participantName: z.string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    timeOptionIds: z.array(z.string().uuid())
      .min(1, "At least one time option is required")
      .max(MAX_TIME_OPTIONS, `At most ${MAX_TIME_OPTIONS} time options can be selected`),
    passcode: z.string()
      .length(4, "Passcode must be exactly 4 characters")
      .regex(/^\d{4}$/, "Passcode must be 4 digits"),
  }),

  // Cancel vote
  cancel: z.object({
    participantName: z.string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    passcode: z.string()
      .length(4, "Passcode must be exactly 4 characters")
      .regex(/^\d{4}$/, "Passcode must be 4 digits")
  }),
};

export const paramsSchema = z.object({
  id: z.string().uuid("Invalid sync id"),
});

export type SyncInput = z.infer<typeof syncInputSchema>;
export type SyncUpdateInput = z.infer<typeof syncUpdateSchema>;
export type VoteInput = z.infer<typeof voteSchema.submit>;
export type CancelVoteInput = z.infer<typeof voteSchema.cancel>;