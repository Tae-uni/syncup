import { RequestHandler } from "express";
import { AppError } from "../../middlewares/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { createSync, getSyncById, verifyLeaderPasscode, updateSync } from "./sync.service";
import { VoteService } from "./vote.service";

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const data = await createSync(req.body);
  res.status(201).json({
    success: true,
    data
  });
});

export const verifyLeader: RequestHandler<{ id: string }> = asyncHandler(async (req, res) => {
  await verifyLeaderPasscode(req.params.id, req.body.leaderPasscode);
  res.status(200).json({
    success: true,
    data: {
      message: "Passcode verified successfully"
    }
  });
});

export const getSync: RequestHandler<{ id: string }> = asyncHandler(async (req, res) => {
  const syncId = req.params.id;

  const syncBasicData = await getSyncById(syncId);
  if (!syncBasicData) {
    throw new AppError('Sync not found', 404, "SYNC_NOT_FOUND");
  }

  const voteDetails = await VoteService.getSyncVotesDetails(syncId);

  const formattedSync = {
    sync: {
      ...syncBasicData,
      timeOptions: syncBasicData?.timeOptions.map(option => ({
        ...option,
        votes: voteDetails.filter(vote => vote.timeOptionId === option.id)
      }))
    }
  };

  res.status(200).json({
    success: true,
    data: formattedSync,
  });
});

export const update: RequestHandler<{ id: string }> = asyncHandler(async (req, res) => {
  const data = await updateSync(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data,
  })
});