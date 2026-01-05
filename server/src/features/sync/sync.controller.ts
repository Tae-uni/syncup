import { Request, Response, NextFunction } from "express";
import { createSync, getSyncById } from "./sync.service";
import { VoteService } from "./vote.service";


export const create = async (req: Request, res: Response) => {
  try {
    console.log('Create sync request:', req.body);

    const sync = await createSync(req.body);
    res.status(201).json({
      success: true,
      sync
    });
  } catch (error) {
    console.error('Error creating sync:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('required') ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getSync = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: syncId } = req.params;

    const syncBasicData = await getSyncById(syncId);

    if (!syncBasicData) {
      return res.status(404).json({
        success: false,
        error: 'Sync not found',
      })
    }

    const votesDetails = await VoteService.getSyncVotesDetails(syncId);

    const formattedSync = {
      sync: {
        ...syncBasicData,
        timeOptions: syncBasicData?.timeOptions.map(option => ({
          ...option,
          votes: votesDetails.filter(vote => vote.timeOptionId === option.id)
        }))
      }
    };


    res.status(200).json({
      success: true,
      data: formattedSync,
    });
  } catch (error) {
    console.error('Error fetching sync:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('required') ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};