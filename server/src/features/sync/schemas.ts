import { z } from "zod";

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
});

export const syncInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeZone: z.string().refine(isValidTimeZone, {
    message: "Invalid time zone",
  }).default("UTC"),
  timeSelector: z.array(timeSelectorSchema).min(1, "At least one time selector is required"),
});

export const voteSchema = {
  // Submit vote
  submit: z.object({
    participantName: z.string()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    timeOptionIds: z.array(z.string().uuid())
      .min(1, "At least one time option is required"),
  }),

  // Cancel vote
  cancel: z.object({
    participantName: z.string()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
  }),
};

export type TimeSelector = z.infer<typeof timeSelectorSchema>;
export type SyncInput = z.infer<typeof syncInputSchema>;
export type VoteInput = z.infer<typeof voteSchema.submit>;
export type CancelVoteInput = z.infer<typeof voteSchema.cancel>;