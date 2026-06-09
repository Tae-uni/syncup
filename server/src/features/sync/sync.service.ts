import bcrypt from "bcrypt";

import prisma from "../../config/prisma";
import { AppError } from "../../middlewares/AppError";
import { SyncInput, SyncUpdateInput } from "./schemas";

export const createSync = async (data: SyncInput) => {
  const { title, description, timeSelector, timeZone, expiresAt } = data;

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
      expiresAt: new Date(expiresAt),
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
  const sync = await prisma.sync.findUnique({
    where: { id },
    include: {
      timeOptions: true,
      participants: true,
    }
  });

  if (!sync) {
    throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");
  }

  if (sync.expiresAt && sync.expiresAt < new Date()) {
    throw new AppError("This Sync has expired", 410, "SYNC_EXPIRED");
  }

  return sync;
};

export const updateSync = async (syncId: string, data: SyncUpdateInput) => {
  await verifyLeaderPasscode(syncId, data.leaderPasscode);

  const existing = await prisma.timeOption.findMany({
    where: { syncId },
    select: { id: true, startTime: true, endTime: true },
  });

  const incomingKeys = new Set(
    data.timeSelector.map((t) => `${t.startTime}|${t.endTime}`)
  );

  const existingKeys = new Set(
    existing.map((e) =>
      `${e.startTime.toISOString()}|${e.endTime.toISOString()}`)
  );

  const idsToDelete = existing
    .filter((e) => !incomingKeys.has(`${e.startTime.toISOString()}|${e.endTime.toISOString()}`))
    .map((e) => e.id);

  const optionsToCreate = data.timeSelector.filter(
    (t) => !existingKeys.has(`${t.startTime}|${t.endTime}`)
  );

  const updated = await prisma.sync.update({
    where: { id: syncId },
    data: {
      title: data.title,
      description: data.description,
      timeZone: data.timeZone,
      timeOptions: {
        deleteMany: { id: { in: idsToDelete } },
        create: optionsToCreate.map((time) => ({
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

export const deleteSync = async (syncId: string, passcode: string): Promise<void> => {
  await verifyLeaderPasscode(syncId, passcode);
  await prisma.sync.delete({ where: { id: syncId } });
}