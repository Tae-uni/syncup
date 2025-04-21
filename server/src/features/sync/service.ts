import prisma from "../../config/prisma";
import { SyncInput } from "./schemas";

export const createSync = async (data: SyncInput) => {
  const { title, description, timeSelector, timeZone } = data;

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
