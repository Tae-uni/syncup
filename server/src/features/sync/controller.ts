import { Request, Response } from "express";
import { createSync, getSyncById } from "./service";

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

export const getSync = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Sync ID is required',
      })
    }

    const sync = await getSyncById(id);

    if (!sync) {
      return res.status(404).json({
        success: false,
        error: 'Sync not found',
      })
    }

    res.status(200).json({
      success: true,
      data: sync,
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