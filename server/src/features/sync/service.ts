import prisma from "../../config/prisma";

export interface TimeSelectorInput {
  date: string;
  startTime: string;
  endTime: string;
}

export interface SyncInput {
  title: string;
  description: string;
  timeSelector: TimeSelectorInput[];
  timeZone?: string;
  expiresAt?: string;
}

export const createSync = async (data: SyncInput) => {
  const { title, description, timeSelector, timeZone, expiresAt } = data;

  if (!title) {
    throw new Error("Title is required");
  }

  if (!timeSelector || timeSelector.length === 0) {
    throw new Error("Time selector is required");
  }

  // let expiration: Date | undefined;

  // if (expiresAt) {
  //   // If an expiration date is provided, use it
  //   expiration = new Date(expiresAt);

  //   const now = new Date();

  //   const maxExpirationDate = new Date(now);
  //   maxExpirationDate.setDate(now.getDate() + 7);

  //   if (expiration > maxExpirationDate) {
  //     expiration = maxExpirationDate;
  //   }
  // } else {
  //   // Default to 3 days if no expiration is provided
  //   expiration = new Date();
  //   expiration.setDate(expiration.getDate() + 3);
  // }

  // Create the sync
  return prisma.sync.create({
    data: {
      title,
      description,
      timeZone: timeZone || 'UTC',
      // expiresAt: expiration,
      timeOptions: {
        create: timeSelector.map((time) => {
          const baseDate = new Date(time.date);

          const [startHour, startMinute] = time.startTime.split(':').map(Number);
          const startTime = new Date(baseDate);
          startTime.setHours(startHour, startMinute, 0, 0);

          const [endHour, endMinute] = time.endTime.split(':').map(Number);
          const endTime = new Date(baseDate);
          endTime.setHours(endHour, endMinute, 0, 0);
          
          return {
            date: baseDate,
            startTime,
            endTime,
          };
        })
      }
    },
    include: {
      timeOptions: true,
    }
  });
};
