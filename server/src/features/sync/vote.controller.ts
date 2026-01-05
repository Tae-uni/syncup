import { Request, Response, NextFunction } from "express";
import { VoteInput, CancelVoteInput } from "./schemas";
import { VoteService } from "./vote.service";

export const submitVote = async (
  req: Request<{ id: string }, {}, VoteInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: syncId } = req.params;
    const { participantName, timeOptionIds, passcode, isNewParticipant } = req.body;

    let result;
    if (isNewParticipant) {
      result = await VoteService.createParticipantAndVote(
        syncId,
        participantName,
        passcode,
        timeOptionIds
      );
    } else {
      result = await VoteService.updateParticipantVote(
        syncId,
        participantName,
        passcode,
        timeOptionIds
      );
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const cancelVote = async (
  req: Request<{ id: string }, {}, CancelVoteInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: syncId } = req.params;
    const { participantName, passcode } = req.body;

    const result = await VoteService.cancelVote(
      syncId,
      participantName,
      passcode
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};