import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { AppError } from "../../middlewares/AppError";

export class VoteService {
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
    const hashedPasscode = await bcrypt.hash(passcode, 10);

    return prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          syncId,
          name: participantName,
          hashedPasscode,
        }
      });

      const votes = await tx.vote.createMany({
        data: timeOptionIds.map(timeOptionId => ({
          participantId: participant.id,
          timeOptionId,
        }))
      });

      return {
        participant: { id: participant.id, name: participant.name },
        voteCount: votes.count,
      };
    });
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

    return prisma.$transaction(async (tx) => {
      await tx.vote.deleteMany({
        where: { participantId: participant.id }
      });

      const votes = await tx.vote.createMany({
        data: timeOptionIds.map(timeOptionId => ({
          participantId: participant.id,
          timeOptionId,
        }))
      });

      return {
        participant: { id: participant.id, name: participant.name },
        voteCount: votes.count,
      };
    });
  }

  static async cancelVote(
    syncId: string,
    participantName: string,
    passcode: string,
  ) {

    const sync = await prisma.sync.findUnique({ where: { id: syncId } });
    if (!sync) throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");
    if (sync.expiresAt && sync.expiresAt < new Date()) {
      throw new AppError("This Sync has expired", 410, "SYNC_EXPIRED");
    }

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
    const sync = await prisma.sync.findUnique({ where: { id: syncId } });
    if (!sync) throw new AppError("Sync not found", 404, "SYNC_NOT_FOUND");

    if (sync.expiresAt && sync.expiresAt < new Date()) {
      throw new AppError("This Sync has expired", 410, "SYNC_EXPIRED");
    }

    const timeOptions = await prisma.timeOption.findMany({
      where: { id: { in: timeOptionIds }, syncId }
    });
    if (timeOptions.length !== timeOptionIds.length) {
      throw new AppError("Invalid time options", 400, "INVALID_TIME_OPTIONS");
    }

    const existing = await prisma.participant.findUnique({
      where: { syncId_name: { syncId, name: participantName } }
    })

    if (!existing) {
      return this.createParticipantAndVote(syncId, participantName, passcode, timeOptionIds);
    }

    return this.updateParticipantVote(syncId, participantName, passcode, timeOptionIds);
  }
}
