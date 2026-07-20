import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

export async function createSync(overrides: Record<string, unknown> = {}) {
  return prisma.sync.create({
    data: {
      title: "Team sync",
      hashedPasscode: await bcrypt.hash("0000", 10),
      timeZone: "UTC",
      ...overrides,
    },
  });
}

export async function createSyncWithOptions(
  optionCount = 2,
  overrides: Record<string, unknown> = {}
) {
  const sync = await createSync(overrides);

  const timeOptions = [];
  for (let i = 0; i < optionCount; i++) {
    timeOptions.push(
      await prisma.timeOption.create({
        data: {
          syncId: sync.id,
          date: new Date(Date.UTC(2026, 0, 10 + i)),
          startTime: new Date(Date.UTC(2026, 0, 10 + i, 9)),
          endTime: new Date(Date.UTC(2026, 0, 10 + i, 10)),
        },
      })
    );
  }
  return { sync, timeOptions };
}

export function createExpiredSyncWithOptions(optionCount = 2) {
  return createSyncWithOptions(optionCount, {
    expiresAt: new Date(Date.now() - 60_000),
  });
}