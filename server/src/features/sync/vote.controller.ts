import { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { VoteInput, CancelVoteInput } from "./schemas";
import { VoteService } from "./vote.service";

export const submitVote: RequestHandler<{ id: string }, any, VoteInput> =
  asyncHandler(
    async (req, res) => {
      const syncId = req.params.id;
      const { participantName, timeOptionIds, passcode } = req.body;

      const result = await VoteService.submitVote(
        syncId,
        participantName,
        passcode,
        timeOptionIds
      );

      res.status(200).json({
        success: true,
        data: result
      });
    })

export const cancelVote: RequestHandler<{ id: string }, any, CancelVoteInput> =
  asyncHandler(
    async (req, res) => {
      const syncId = req.params.id;
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
    }
  )