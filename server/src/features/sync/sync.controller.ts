import { RequestHandler } from "express";
import { AppError } from "../../middlewares/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { createSync, getSyncById } from "./sync.service";
import { VoteService } from "./vote.service";

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const data = await createSync(req.body);
  res.status(201).json({
    success: true,
    data
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