import prisma from "../../config/prisma";
import { SyncInput } from "./schemas";

export const createSync = async (data: SyncInput) => {
  const { title, description, timeSelector, timeZone } = data;

  // Create the sync
  const created = await prisma.sync.create({
    data: {
      title,
      description,
      timeZone: timeZone || 'UTC',
      // expiresAt: expiration,
      timeOptions: {
        create: timeSelector.map((time) => ({
          date: new Date(time.date),
          startTime: new Date(time.startTime),
          endTime: new Date(time.endTime),
        })),
      },
    },
    select: { id: true },
  });

  return created;
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