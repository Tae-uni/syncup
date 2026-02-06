import * as bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { AppError } from "../../middlewares/AppError";

export class VoteService {
  static async createParticipant(
    syncId: string,
    participantName: string,
    passcode: string
  ) {
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        syncId_name: { syncId, name: participantName },
      }
    });

    if (existingParticipant) {
      throw new AppError("Participant already exists", 409, "PARTICIPANT_EXISTS");
    }

    return prisma.participant.create({
      data: {
        syncId,
        name: participantName,
        hashedPasscode: await bcrypt.hash(passcode, 10),
      }
    });
  }

  static async verifyParticipant(
    syncId: string,
    participantName: string,
    passcode: string
  ) {
    const participant = await prisma.participant.findUnique({
      where: {
        syncId_name: { syncId, name: participantName },
      }
    });

    if (!participant) {
      throw new AppError("Participant not found", 404, "PARTICIPANT_NOT_FOUND");
    }

    const isValidPasscode = await bcrypt.compare(
      passcode,
      participant.hashedPasscode
    );

    if (!isValidPasscode) {
      throw new AppError("Invalid passcode", 401, "INVALID_PASSCODE");
    }

    return participant;
  }

  static async createParticipantAndVote(
    syncId: string,
    participantName: string,
    passcode: string,
    timeOptionIds: string[],
  ) {
    const sync = await prisma.sync.findUnique({
      where: { id: syncId },
    });

    if (!sync) {
      throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");
    }

    const timeOptions = await prisma.timeOption.findMany({
      where: {
        id: { in: timeOptionIds },
        syncId,
      }
    });

    if (timeOptions.length !== timeOptionIds.length) {
      throw new AppError("Invalid time options", 400, "INVALID_TIME_OPTIONS");
    }

    const participant = await this.createParticipant(
      syncId,
      participantName,
      passcode
    );

    const votes = await prisma.vote.createMany({
      data: timeOptionIds.map(timeOptionId => ({
        participantId: participant.id,
        timeOptionId,
      }))
    });

    return {
      participant,
      voteCount: votes.count,
    };
  }

  static async updateParticipantVote(
    syncId: string,
    participantName: string,
    passcode: string,
    timeOptionIds: string[],
  ) {
    const participant = await this.verifyParticipant(
      syncId,
      participantName,
      passcode
    );

    await prisma.vote.deleteMany({
      where: {
        participantId: participant.id,
      }
    });

    const votes = await prisma.vote.createMany({
      data: timeOptionIds.map(timeOptionId => ({
        participantId: participant.id,
        timeOptionId,
      }))
    });

    return {
      participant,
      voteCount: votes.count,
    };
  }

  static async cancelVote(
    syncId: string,
    participantName: string,
    passcode: string,
  ) {
    const participant = await this.verifyParticipant(
      syncId,
      participantName,
      passcode
    );

    // Delete participant (votes are cascade deleted)
    await prisma.participant.delete({
      where: { id: participant.id }
    });

    return {
      deletedParticipantId: participant.id,
    };
  }

  static async getSyncVotesDetails(syncId: string) {
    const votes = await prisma.vote.findMany({
      where: {
        timeOption: {
          syncId
        }
      },
      include: {
        participant: true,
      }
    });

    return votes.map(vote => ({
      timeOptionId: vote.timeOptionId,
      participantId: vote.participantId,
      participantName: vote.participant.name,
      timestamp: vote.createdAt
    }));
  }

  static async submitVote(
    syncId: string,
    participantName: string,
    passcode: string,
    timeOptionIds: string[],
  ) {
    const sync = await prisma.sync.findUnique({
      where: { id: syncId },
    });
    if (!sync) {
      throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");
    }

    const timeOptions = await prisma.timeOption.findMany({
      where: { id: { in: timeOptionIds }, syncId }
    });
    if (timeOptions.length !== timeOptionIds.length) {
      throw new AppError("Invalid time options", 400, "INVALID_TIME_OPTIONS");
    }

    const existing = await prisma.participant.findUnique({
      where: { syncId_name: { syncId, name: participantName}}
    })

    if (!existing) {
      return this.createParticipantAndVote(syncId, participantName, passcode, timeOptionIds);
    }

    const isValid = await bcrypt.compare(passcode, existing.hashedPasscode);
    if (!isValid) {
      throw new AppError("Invalid passcode", 401, "INVALID_PASSCODE");
    }

    return this.updateParticipantVote(syncId, participantName, passcode, timeOptionIds);
  }
}
