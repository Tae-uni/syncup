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
          const date = new Date(time.date);
          const startTime = new Date(time.startTime);
          const endTime = new Date(time.endTime);

          return {
            date,
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

export const getSyncById = async (id: string) => {
  return prisma.sync.findUnique({
    where: { id },
    include: {
      timeOptions: true,
      participants: true,
    }
  });
};