import bcrypt from "bcrypt";

import prisma from "../../config/prisma";
import { AppError } from "../../middlewares/AppError";
import { SyncInput } from "./schemas";

export const createSync = async (data: SyncInput) => {
  const { title, description, timeSelector, timeZone } = data;

  for (const t of timeSelector) {
    const start = new Date(t.startTime);
    const end = new Date(t.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new AppError("Invalid time format", 400, "INVALID_TIME_FORMAT");
    }
    if (start >= end) {
      throw new AppError("End time must be after start time", 400, "INVALID_TIME_RANGE");
    }
  }

  const hashedPasscode = await bcrypt.hash(data.leaderPasscode, 10);

  // Create the sync
  const created = await prisma.sync.create({
    data: {
      title,
      description,
      timeZone: timeZone || 'UTC',
      // expiresAt: expiration,
      hashedPasscode,
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