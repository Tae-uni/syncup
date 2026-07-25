import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";

import prisma from "../src/config/prisma";
import { VoteService } from "../src/features/sync/vote.service";
import { createSyncWithOptions, createExpiredSyncWithOptions } from "./helpers";

describe("VoteService.submitVote", () => {
  it("creates a new participant and their votes", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(2);

    const result = await VoteService.submitVote(
      sync.id,
      "Alice",
      "1234",
      [timeOptions[0].id, timeOptions[1].id]
    );

    expect(result.voteCount).toBe(2);
    expect(result.participant.name).toBe("Alice");

    const participants = await prisma.participant.findMany({
      where: { syncId: sync.id },
    });
    expect(participants).toHaveLength(1);

    const votes = await prisma.vote.findMany({
      where: { participantId: result.participant.id },
    });
    expect(votes).toHaveLength(2);
    // passcode should be hashed
    const stored = participants[0].hashedPasscode;
    expect(stored).not.toBe("1234");
    expect(await bcrypt.compare("1234", stored)).toBe(true);
  });

  it("updates votes for an existing participant without duplicating them", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(3);
    await VoteService.submitVote(sync.id, "Alice", "1234", [
      timeOptions[0].id,
      timeOptions[1].id,
    ]);

    const result = await VoteService.submitVote(sync.id, "Alice", "1234", [
      timeOptions[2].id,
    ]);

    expect(result.voteCount).toBe(1);

    const participants = await prisma.participant.findMany({
      where: { syncId: sync.id },
    });
    expect(participants).toHaveLength(1);

    const votes = await prisma.vote.findMany({
      where: { participantId: result.participant.id },
    });
    // re-voting replaces the old picks instead of adding
    expect(votes).toHaveLength(1);
    expect(votes[0].timeOptionId).toBe(timeOptions[2].id);
  });

  it("rejects voting on an expired sync", async () => {
    const { sync, timeOptions } = await createExpiredSyncWithOptions(1);
    await expect(
      VoteService.submitVote(sync.id, "Bob", "1234", [timeOptions[0].id])).rejects.toMatchObject({ code: "SYNC_EXPIRED", statusCode: 410 });
  });

  it("rejects time options that don't belong to the sync", async () => {
    const { sync } = await createSyncWithOptions(1);
    const bogusId = "00000000-0000-0000-0000-000000000000";
    await expect(
      VoteService.submitVote(sync.id, "Bob", "1234", [bogusId])
    ).rejects.toMatchObject({ code: "INVALID_TIME_OPTIONS", statusCode: 400 });
  })
});

describe("VoteService.cancelVote", () => {
  it("removes the participant and their votes", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(2);
    await VoteService.submitVote(sync.id, "Alice", "1234", [
      timeOptions[0].id,
      timeOptions[1].id,
    ]);

    const result = await VoteService.cancelVote(sync.id, "Alice", "1234");
    expect(result.deletedParticipantId).toBeDefined();

    // participant and their votes are both gone
    const participants = await prisma.participant.findMany({ where: { syncId: sync.id } });
    expect(participants).toHaveLength(0);
    const votes = await prisma.vote.findMany({
      where: { participantId: result.deletedParticipantId },
    });
    expect(votes).toHaveLength(0);
  });

  it("rejects cancellation with a wrong passcode", async () => {
    const { sync, timeOptions } = await createSyncWithOptions(1);
    await VoteService.submitVote(sync.id, "Alice", "1234", [timeOptions[0].id]);
    await expect(
      VoteService.cancelVote(sync.id, "Alice", "9999")
    ).rejects.toMatchObject({ code: "INVALID_PASSCODE", statusCode: 401 });
  });
});