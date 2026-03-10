import bcrypt from "bcrypt";

import prisma from "../../config/prisma";
import { AppError } from "../../middlewares/AppError";
import { SyncInput, SyncUpdateInput } from "./schemas";

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

export const verifyLeaderPasscode = async (syncId: string, passcode: string): Promise<void> => {
  const sync = await prisma.sync.findUnique({
    where: { id: syncId },
    select: { hashedPasscode: true },
  });

  if (!sync) {
    throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");
  }

  const isValid = await bcrypt.compare(passcode, sync.hashedPasscode);
  if (!isValid) {
    throw new AppError("Invalid passcode", 401, "INVALID_PASSCODE");
  }
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

export const updateSync = async (syncId: string, data: SyncUpdateInput) => {
  await verifyLeaderPasscode(syncId, data.leaderPasscode);

  const updated = await prisma.sync.update({
    where: { id: syncId },
    data: {
      title: data.title,
      description: data.description,
      timeZone: data.timeZone,
      timeOptions: {
        deleteMany: {},
        create: data.timeSelector.map((time) => ({
          date: new Date(time.date),
          startTime: new Date(time.startTime),
          endTime: new Date(time.endTime),
        })),
      },
    },
    select: { id: true },
  });

  return updated;
};