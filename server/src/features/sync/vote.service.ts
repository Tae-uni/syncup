import prisma from "../../config/prisma";

export class VoteService {
  static async submitVote(syncId: string, participantName: string, timeOptionIds: string[]) {
    // Check if sync exists
    const sync = await prisma.sync.findUnique({
      where: { id: syncId },
    });

    if (!sync) {
      throw new Error("Sync not found");
    }

    // Check if time options exist
    const timeOptions = await prisma.timeOption.findMany({
      where: {
        id: { in: timeOptionIds },
        syncId,
      }
    });

    if (timeOptions.length !== timeOptionIds.length) {
      throw new Error("Invalid time options");
    }

    // Check if participant exists
    const participant = await prisma.participant.upsert({
      where: {
        syncId_name: {
          syncId,
          name: participantName,
        }
      },
      create: {
        syncId,
        name: participantName,
      },
      update: {},
    });

    // Delete all existing votes for this participant
    await prisma.vote.deleteMany({
      where: {
        participantId: participant.id,
      }
    });

    // Create new votes
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

  // Cancel vote
  static async cancelVote(syncId: string, participantName: string) {
    const participant = await prisma.participant.findUnique({
      where: {
        syncId_name: {
          syncId,
          name: participantName,
        }
      }
    });

    if (!participant) {
      throw new Error("Participant not found");
    }

    const result = await prisma.vote.deleteMany({
      where: {
        participantId: participant.id
      }
    });

    return {
      participant,
      deletedCount: result.count,
    };
  }

  // Get votes for a sync
  static async getVotes(syncId: string) {
    const votes = await prisma.vote.findMany({
      where: {
        timeOption: {
          syncId
        }
      },
      include: {
        participant: true,
        timeOption: true,
      }
    });

    return votes.reduce((acc, vote) => {
      const key = `${vote.timeOption.date.toISOString()}_${vote.timeOption.startTime.toISOString()}_${vote.timeOption.endTime.toISOString()}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(vote.participant.name);
      return acc;
    }, {} as Record<string, string[]>);
  }
}
