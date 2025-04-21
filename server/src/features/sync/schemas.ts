import { z } from "zod";

const isValidTimeZone = (tz: string) => {
  try {
    Intl.DateTimeFormat(tz);
    return true;
  } catch {
    return false;
  }
}

export const timeSelectorSchema = z.object({
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date",
  }),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid start time"),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid end time"),
});

export const syncInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeZone: z.string().refine(isValidTimeZone, {
    message: "Invalid time zone",
  }).default("UTC"),
  timeSelector: z.array(timeSelectorSchema).min(1, "At least one time selector is required"),
});

export type TimeSelector = z.infer<typeof timeSelectorSchema>;
export type SyncInput = z.infer<typeof syncInputSchema>;