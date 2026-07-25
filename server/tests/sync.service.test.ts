import { describe, it, expect } from "vitest";
import bcrypt from 'bcrypt';

import prisma from "../src/config/prisma";
import { createSync, getSyncById, updateSync } from "../src/features/sync/sync.service";
import { VoteService } from "../src/features/sync/vote.service";
import { createSyncWithOptions } from "./helpers";

describe("updateSync", () => {
  it("keeps votes on unchanged options when the leader edits the options", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(2);
    await VoteService.submitVote(sync.id, "Alice", "1234", [
      timeOptions[0].id,
      timeOptions[1].id,
    ]);

    await updateSync(sync.id, {
      title: "Team sync",
      timeZone: "UTC",
      leaderPasscode: "0000",
      timeSelector: [
        {
          date: timeOptions[0].date.toISOString(),
          startTime: timeOptions[0].startTime.toISOString(),
          endTime: timeOptions[0].endTime.toISOString(),
        },
        {
          date: new Date(Date.UTC(2026, 0, 20)).toISOString(),
          startTime: new Date(Date.UTC(2026, 0, 20, 9)).toISOString(),
          endTime: new Date(Date.UTC(2026, 0, 20, 10)).toISOString(),
        },
      ],
    });

    // kept slot still ahs its vote, removed slot lost its vote too
    const kept = await prisma.timeOption.findUnique({ where: { id: timeOptions[0].id } });
    expect(kept).not.toBeNull();
    const survivingVotes = await prisma.vote.findMany({ where: { timeOptionId: timeOptions[0].id } });
    expect(survivingVotes).toHaveLength(1);

    // Assert: option 1 + its vote are gone
    const removed = await prisma.timeOption.findUnique({ where: { id: timeOptions[1].id } });
    expect(removed).toBeNull();
    const removedVotes = await prisma.vote.findMany({ where: { timeOptionId: timeOptions[1].id } });
    expect(removedVotes).toHaveLength(0);
  });

  it("rejects an update with a wrong leader passcode", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(1);
    await expect(
      updateSync(sync.id, {
        title: "Team sync",
        timeZone: "UTC",
        leaderPasscode: "9999",
        timeSelector: [{
          date: timeOptions[0].date.toISOString(),
          startTime: timeOptions[0].startTime.toISOString(),
          endTime: timeOptions[0].endTime.toISOString(),
        }],
      })
    ).rejects.toMatchObject({ code: "INVALID_PASSCODE", statusCode: 401 });
  });
});

describe("getSyncById", () => {
  it("returns a sync with its options and participants", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(2);
    await VoteService.submitVote(sync.id, "Alice", "1234", [timeOptions[0].id]);

    const result = await getSyncById(sync.id);
    expect(result.id).toBe(sync.id);
    expect(result.timeOptions).toHaveLength(2);
    expect(result.participants).toHaveLength(1);
  });

  it("rejects reading a sync that does not exist", async () => {
    await expect(
      getSyncById("00000000-0000-0000-0000-000000000000")
    ).rejects.toMatchObject({ code: "SYNC_NOT_FOUND", statusCode: 404 });
  });
});

describe("createSync", () => {
  const validSlot = {
    date: "2026-01-10",
    startTime: "2026-01-10T09:00:00.000Z",
    endTime: "2026-01-10T10:00:00.000Z",
  }
  const future = new Date(Date.now() + 86_400_000).toISOString();

  it("creates a sync and stores the passcode hashed", async () => {
    const created = await createSync({
      title: "New sync",
      timeZone: "UTC",
      leaderPasscode: "1234",
      expiresAt: future,
      timeSelector: [validSlot],
    });
    expect(created.id).toBeDefined();

    const stored = await prisma.sync.findUnique({ where: { id: created.id } });
    // stored hashed, not the raw "1234"
    expect(stored!.hashedPasscode).not.toBe("1234");
    expect(await bcrypt.compare("1234", stored!.hashedPasscode)).toBe(true);
  });

  it("rejects an invalid time format", async () => {
    await expect(
      createSync({
        title: "Bad",
        timeZone: "UTC",
        leaderPasscode: "1234",
        expiresAt: future,
        timeSelector: [{
          date: "2026-01-10",
          startTime: "not-a-date",
          endTime: validSlot.endTime
        }],
      })
    ).rejects.toMatchObject({ code: "INVALID_TIME_FORMAT", statusCode: 400 });
  });

  it("rejects when end is before start", async () => {
    await expect(
      createSync({
        title: "Bad",
        timeZone: "UTC",
        leaderPasscode: "1234",
        expiresAt: future,
        timeSelector: [{
          date: "2026-01-10",
          startTime: validSlot.endTime,
          endTime: validSlot.startTime
        }],
      })
    ).rejects.toMatchObject({ code: "INVALID_TIME_RANGE", statusCode: 400 });
  });
});