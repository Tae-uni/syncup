import { Request, Response } from "express";
import { createSync } from "./service";

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
